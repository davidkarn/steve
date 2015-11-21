define(['react', 'lodash', 'templates/home.rt'], function (React, _, home_template) {
    'use strict';
    var speech = new p5.Speech();

    function setup_annyang() {
        var me = this;
        var commands = {
            'steve make me a sandwich': function() {
                me.setState({message: "I'm sorry Dave, I can't do that."}); },
            'steve hello': function() {
                console.log('hello', arguments);
                me.setState({message: "Sup dog."}); },
            'test': function() {
                console.log('hello', arguments);
                me.setState({message: "Sup dog."}); }}; 
        console.log(commands);        
        annyang.addCommands(commands);
        annyang.addCallback('result', function (said) {
            http('post', '/api/v1/parse', {messages: said},
                 print,
                 print_err); 
            me.setState({said: said}); });
        annyang.debug();
        annyang.start({ autoRestart: true, continuous: false }); }

    function speak(text) {
        speech.setVoice('Google UK English Male');
        return speech.speak(text); }

    function process_part(part) {
        if (part.steve_did) {
            this.setState({log: this.state.log.concat([part.steve_did])});
            speak(part.steve_did); }}

    function run_message(e) {
        var me = this;
        e.preventDefault();
        var message = ref_value(this.refs.input);

        $.ajax({type: 'post',
                url: '/api/v1/parse',
                data: {messages: [message]},
                success: function(response) {
                    console.log(response);
                    response.map(me.process_part);
                   me.setState({parsed: JSON.stringify(response)}); },
                error: function(x) {
                    console.log(x); }}); }
            
    function render() {
        return home_template.apply(this, arguments); }

    return React.createClass({
        displayName:         'home',
        go_to:                go_to,
        process_part:         process_part,
        run_message:          run_message,
        componentWillMount:   setup_annyang,
        getInitialState:      returner({message: '', parsed: '', log: []}),
        render:               render}); });
