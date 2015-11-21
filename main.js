var express         = require('express'),
    errorHandler    = require('errorhandler'),
    http            = require('http'),
    querystring     = require('querystring'),
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

function get_commands(pos) {
    pos = remove_ok_steve(pos);
    console.log(pos);
    return split_commands(pos); }

function do_in_sequence(fns, last) {
    function go() {
        var fn = fns.shift();
        console.log(fn);
        if (!fn)
            (last || do_nothing)();
        else
            fn.apply(fn, [go]); }
    go(); }

app.post('/api/v1/parse', function(req, res) {
    var messages    = req.body.messages;
    var fns         = [];

    for (var i in messages) {
        console.log(messages[i]);
        fns.push(curry(process_message, messages[i])); }
    process_message(messages[i], function(x) {
        res.json(x); }); });

app.use(express.static(process.cwd() + '/public')); 
