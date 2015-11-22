var express         = require('express'),
    errorHandler    = require('errorhandler'),
    http            = require('http'),
    querystring     = require('querystring'),
    clj             = require('clj-fuzzy'),
    request         = require('request'),
    pos             = require('node-pos');
var bodyParser      = require('body-parser');
var cookieParser    = require('cookie-parser');
var methodOverride  = require('method-override');
var session         = require('express-session');

var app             = express();
var port            = process.env.PORT || 8080;
var names           = [];
var courses         = [];
var assignments     = [];


app.listen(port);

function curry(that) {
    var args = to_array(arguments).slice(1);

    return function() {
	var oldargs = args.slice(0);
	var newargs = to_array(arguments);
	var j = 0;
	for (var i in oldargs)
	    if (oldargs[i] === undefined) {
		oldargs[i] = newargs[j];
		j += 1; }

	var as = oldargs.concat(newargs.slice(j));

        if (that instanceof Array)
            return that[0].apply(that[1], as);
        else
	    return that.apply(that, as); }; }

function to_array(what) {
    var i; 
    var ar = [];
 
    for (i = 0; i < what.length; i++) {
        ar.push(what[i]); }

    return ar; }

var env = process.env.NODE_ENV || 'development';
if (env == 'development') {
    app.use(errorHandler()); }

if (env == 'production') {}

app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({ secret:               'alkfjdsklfjdas23440392qhfaewgfhp',
                  saveUninitialized:     true,
                  resave:                true}));

function do_nothing() {}

function parts_of_speech(string, next) {
    pos.partsOfSpeech(string, next || do_nothing); }

function process_message(msg, next) {
    parts_of_speech(msg, function(pos) {
        next(get_commands(pos[0])); }); }

function cmpi(w1, w2) {
    return ((w1 || "").toLowerCase() == (w2 || "").toLowerCase()
            || clj.metrics.jaro(w1, w2) > 0.8); }

// aaah, hack!
var started_with_ok = false;
function remove_ok_steve(pos) {
    var last_was_ok = false;
    for (var i in pos) {
        if (cmpi(pos[i].word, "ok") || cmpi(pos[i].word, "okay"))
            last_was_ok = true;
        else if (cmpi(pos[i].word, "steve") && (/*i == 0 || */ last_was_ok)) {
            started_with_ok = true;
            return pos.slice(parseInt(i) + 1); }
        else
            last_was_ok = false; }
    started_with_ok = false;
    return pos; }
            
function split_commands(pos) {
    var commands = [[]];
    
    for (var i in pos) {
        var word = pos[i];
        if (cmpi(word.word, "then"))
            commands = [[]].concat(commands);
        else
            commands[0].push(word); }
    return commands; }

function extractor(x) {
    return function(y) {
        return y[x]; }; }

function runner(x) {
    return function(y) {
        return y[x](); }; }

function member(ar, value) {
    return ar.indexOf(value) >= 0; }

function member_i(ar, value) {
    for (var i in ar)
        if (cmpi(ar[i], value))
            return ar[i];
    return false; }   

function command_name(words) {
    if (cmpi(words[0], 'start') && cmpi(words[1], 'grading'))
        return 'start_grading';
    if (cmpi(words[0], 'enter') || cmpi(words[0], 'open'))
        return 'enter_course';
    if (cmpi(words[0], 'dictate')
        || (cmpi(words[0], 'start') && cmpi(words[0], 'dictating')))
        return 'dictate_note';
    if (member_i(['stop', 'done', 'finished'], words[0]) && cmpi(words[1], 'grading'))
        return 'stop_grading';
    if ((cmpi(words[0], 'finished') || cmpi(words[0], 'done')) && started_with_ok)
        return 'finished';
    if (member_i(['scored', 'score', 'scores'], words[1])
        || member_i(['scored', 'score', 'scores'], words[2]))
        return 'update_grade'; }

function after_word(words, word_choices) {
    for (var i in words) 
        if (member_i(word_choices, words[i]))
            return words.slice(parseInt(i) + 1); 
    return []; }

function before_word(words, word_choices) {
    var before = [];
    for (var i in words) {
        if (member_i(word_choices, words[i]))
            return before;
        else
            before.push(words[i]); }
    return before; }

function command_params(command, words) {
    var end_words;
    if (command == 'enter_course') {
        end_words = after_word(words, ['course']);
        if (!end_words[0]) end_words = after_word(words, ['enter']);
        if (!end_words[0]) end_words = after_word(words, ['open']);        
        return {for:   closest_name(end_words.join(" "), courses),
                given: end_words.join(" ")}; }

    if (command == 'dictate_note') {
        end_words = after_word(words, ['for']);
        if (!end_words[0]) end_words = after_word(words, ['note']); 
        if (!end_words[0]) end_words = after_word(words, ['dictate']); 
        return {for:   closest_name(end_words.join(" "), names),
                given: end_words.join(" ")}; }

    if (command == 'start_grading') {
        var end_words = after_word(words, ['for']);
        if (!end_words[0]) end_words = after_word(words, ['grading']); 
        return {for: closest_name(end_words.join(" "), assignments)}; }

    if (command == 'update_grade') {
        var student       = before_word(words, ['scored', 'score', 'scores']).join(" ");
        var scores        = after_word(words, ['scored', 'score', 'scores']);
        var first_score   = before_word(scores, ['out']).join(" ").match(/[0-9]+/);
        first_score       = parseInt((first_score && first_score[0]) || 0);
        var second_score  = parseInt(after_word(scores, ['of']).join(" "));

        return {student:            closest_name(student, names),
                supplied_student:   student,
                score:              first_score,
                out_of:             second_score}; }}
        
function what_steve_did(cmd) {
    if (cmd.invalid_command) {
        if (cmd.invalid_command == 'update_grade') {
            return cmd.params.supplied_student + " isn't in the class."; }
        if (cmd.invalid_command == 'enter_course') {
            return "I couldn't find that class."; }
        if (cmd.invalid_command == 'start_grading') {
            return "I couldn't find that assignment."; }}
        
    if (cmd.command == 'enter_course')
        return 'Opening ' + (cmd.params.for || 'course') + '.';
    if (cmd.command == 'finished')
        return 'Finished';
    if (cmd.command == 'dictate_note')
        return 'Alright, begin dictating for ' + (cmd.params.for || 'student');
    if (cmd.command == 'start_grading')
        return 'Grading ' + (cmd.params.for || 'now') + '.';
    if (cmd.command == 'update_grade' && cmd.params.student && cmd.params.score)
        return ('Gave ' + cmd.params.student + ' a score of ' + cmd.params.score.toString()
                + ((cmd.params.out_of && ' out of '
                   + cmd.params.out_of.toString()) || '')) + '.';
    if (cmd.command == 'stop_grading')
        return 'Finished grading.';
    if (!cmd.command && cmd.sentance[0] == 'ok' && cmd.sentance[0] == 'steve'|| started_with_ok)
        return "Sorry, I don't understand that."; }
        
function extract_command(sentance) {
    var words       = sentance.map(extractor('word')).map(runner('toLowerCase'));
    var obj         = {sentance:   words,
                       command:    command_name(words)};
    
    obj.params      = command_params(obj.command, words);

    if (((obj.command == 'enter_course'
         || obj.command == 'start_grading')
         && !obj.params.for)
       || (obj.command == 'update_grade' && !obj.params.student)) {
        obj.invalid_command = obj.command;
        obj.command = false; }

    obj.steve_did   = what_steve_did(obj);
    return obj; }    

function get_commands(pos) {
    pos = remove_ok_steve(pos);

    return split_commands(pos).map(extract_command); }

function do_in_sequence(fns, last) {
    function go() {
        var fn = fns.shift();

        if (!fn)
            (last || do_nothing)();
        else
            fn.apply(fn, [go]); }
    go(); }

function compare_names(n1, n2) {
    if (!n1.match(/ /))
        n2 = n2.split(' ')[0];
    var jaro = clj.metrics.jaro(n1, n2);
    var jaro_metaphone = clj.metrics.jaro(
        clj.phonetics.metaphone(n1),
        clj.phonetics.metaphone(n2));
    return jaro + jaro_metaphone; }

function closest_name(name, names) {
    if (!name) return name;
    var highest       = false;
    var highest_score = 0;
    for (var i in names) {
        var score = compare_names(name, names[i]);
        if (score > highest_score) {
            highest       = names[i];
            highest_score = score; }}
    if (highest_score < 1.5)
        return false;
    return highest; }
    

app.post('/api/v1/parse', function(req, res) {
    var messages    = req.body.messages;
    var fns         = [];
    names           = req.body.students;
    courses         = req.body.courses;
    assignments     = req.body.assignments;

    for (var i in messages) {
        fns.push(curry(process_message, messages[i])); }
    process_message(messages[i], function(x) {
        res.json(x); }); });

//
// CANVAS API
//

var canvas_scopes;
var canvas_clientid      = 'dj0yJmk9eVI0d3FidHZSS1BtJmQ9WVdrOU9VbGlSRzR4Tkc4bWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD1kNA--';
var canvas_secret        = 'b5f9016d027449189fcfaa31a9de43104c2f10e1';
var canvas_redirect_url  = 'http://localhost:8080/connect/canvas';


var canvas_oauth2 = require('simple-oauth2')(
    {clientID:             canvas_clientid,
     clientSecret:         canvas_secret,
     site:                 'http://canvas.emanuelzephir.com:3000',
     authorizationPath:   "/login/oauth2/auth",
     tokenPath:           "/login/oauth2/token"});
 
app.get('/auth/canvas', function (req, res) {
    res.redirect(canvas_oauth2.authCode.authorizeURL({
        redirect_uri:    canvas_redirect_url,
        scope:           (canvas_scopes || []).join(" ")})); });

app.get('/connect/canvas', function(req, res) {
    var code = req.query.code;
    canvas_oauth2
        .authCode
        .getToken({code:           code,
                   redirect_uri:   canvas_redirect_url},
                  function(error, result) {
                      res.redirect('/#/home?canvas_token='
                                   + result.access_token.toString()); }); });

//
// Moodle
//

var moodle_key       = 'd962f2897bb81c6294e8637d6c6047b2';
var moodle_url       = 'http://canvas.emanuelzephir.com/';
var moodle_endpoint  = moodle_url + 'moodle/webservice/rest/server.php';
var moodle_cmds      = {get_courses:      'core_course_get_courses',
                        get_users:        'core_enrol_get_enrolled_users',
                        save_grade:       'mod_assign_save_grade',
                        add_note:         'core_notes_create_notes',
                        get_assignments:  'mod_assign_get_assignments'};

function moodle_api(fn_name, params, next) {
    params.wsfunction   = fn_name;
    params.wstoken      = moodle_key;
    params.moodlewsrestformat = 'json';

    request.post(moodle_endpoint,
                 {form: params},
                 function(err, response, body) {
                     if (err) {
                         next(false);
                         console.log('error', err, body, response); }
                     body = JSON.parse(body);
                     next(body); }); }

app.post('/api/v1/moodle', function(req, res) {
    var command = moodle_cmds[req.body.command];
    var params  = req.body.params || {};

    moodle_api(command, params, function(response) {
        res.json(response); }); });    

app.use(express.static(process.cwd() + '/public')); 
