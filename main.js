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
    console.log(msg);
    parts_of_speech(msg, function(pos) {
        console.log(pos[0]);
        next(get_commands(pos[0])); }); }

function cmpi(w1, w2) {
    return (w1 || "").toLowerCase() == (w2 || "").toLowerCase(); }

function remove_ok_steve(pos) {
    var last_was_ok = false;
    for (var i in pos) {
        if (cmpi(pos[i].word, "ok"))
            last_was_ok = true;
        else if (cmpi(pos[i].word, "steve") && last_was_ok) {

            return pos.slice(parseInt(i) + 1); }
        else
            last_was_ok = false; }
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

function command_name(words) {
    if (words[0] == 'start' && words[1] == 'grading')
        return 'start_grading';
    if (member(['stop', 'done', 'finished'], words[0]) && words[1] == 'grading')
        return 'stop_grading';
    if (member(['scored', 'score', 'scores'], words[1])
        || member(['scored', 'score', 'scores'], words[2]))
        return 'update_grade'; }

function after_word(words, word_choices) {
    for (var i in words) {
        if (member(word_choices, words[i]))
            return words.slice(parseInt(i) + 1); }
    return []; }

function before_word(words, word_choices) {
    var before = [];
    for (var i in words) {
        if (member(word_choices, words[i]))
            return before;
        else
            before.push(words[i]); }
    return before; }

function command_params(command, words) {
    if (command == 'start_grading') {
        words = after_word(words, ['for']);
        return {for: closest_name(words.join(" "), assignments)}; }
    if (command == 'update_grade') {
        var student       = before_word(words, ['scored', 'score', 'scores']).join(" ");
        var scores        = after_word(words, ['scored', 'score', 'scores']);
        var first_score   = parseInt(before_word(scores, ['out']).join(" "));
        var second_score  = parseInt(after_word(scores, ['of']).join(" "));
        return {student: closest_name(student, names),
                score:   first_score,
                out_of:  second_score}; }}
        
function extract_command(sentance) {
    var words    = sentance.map(extractor('word')).map(runner('toLowerCase'));
    var obj      = {sentance:   words,
                    command:    command_name(words)};
    
    obj.params   = command_params(obj.command, words);
    return obj; }    

function get_commands(pos) {
    pos = remove_ok_steve(pos);
    console.log(pos);
    return split_commands(pos).map(extract_command); }

function do_in_sequence(fns, last) {
    function go() {
        var fn = fns.shift();
        console.log(fn);
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

var names = ['Billy Johnson', 'Freddie Mercury', 'Freddie Kruger', 'Jimmy Johns', 'Papa Smurf',
             'Bart Simpson', 'Ralph Wiggums', 'Milhouse Vanhouten'];

var assignments = ['Science', 'Pop some punk ass bloods', 'Pet a Kitten', 'Reincarnate Satan', 'History', 'Literature', 'Pop quiz'];

function closest_name(name, names) {
    if (!name) return name;
    var highest       = false;
    var highest_score = 0;
    for (var i in names) {
        var score = compare_names(name, names[i]);
        if (score > highest_score) {
            highest       = names[i];
            highest_score = score; }}
    return highest; }
    

app.post('/api/v1/parse', function(req, res) {
    var messages    = req.body.messages;
    var fns         = [];

    for (var i in messages) {
        console.log(messages[i]);
        fns.push(curry(process_message, messages[i])); }
    process_message(messages[i], function(x) {
        res.json(x); }); });

app.use(express.static(process.cwd() + '/public')); 
