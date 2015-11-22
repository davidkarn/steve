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
            post_message(said[0]); });
        annyang.debug();
        annyang.start({ autoRestart: true, continuous: false }); }

    function speak(text) {
        speech.setVoice('Google UK English Male');
        return speech.speak(text); }

    function process_part(part) {
        if (part.steve_did) {
            this.setState({log: this.state.log.concat([part.steve_did])});
            speak(part.steve_did); }

        if (part.command == 'start_grading') 
            this.setState({grading: part.params.for || "."});
        
        if (part.command == 'stop_grading') 
            this.setState({grading: false}); }

    function connect_with_canvas() {
        window.location.href = ('/auth/canvas'); }

    function run_message(e) {
        var me = this;
        e.preventDefault();
        var message = ref_value(this.refs.input);

        this.post_message(message); }

    function post_message(message) {
        var me = this;
        $.ajax({type: 'post',
                url: '/api/v1/parse',
                data: {messages: [message]},
                success: function(response) {
                    console.log(response);
                    response.map(me.process_part);
                   me.setState({parsed: JSON.stringify(response)}); },
                error: function(x) {
                    console.log(x); }}); }
            
    function changeImage() {
        var image = document.getElementById('myImage');
        if (image.src.match("bulbon")) 
            image.src = "logo2.png";
        else 
            image.src = "logo.png"; }

    function render() {
        return home_template.apply(this, arguments); }

    return React.createClass({
        displayName:         'home',
        go_to:                go_to,
        process_part:         process_part,
        post_message:         post_message,
        run_message:          run_message,
        connect_with_canvas:  connect_with_canvas,
        componentWillMount:   setup_annyang,
        getInitialState:      returner({message:  '',
                                        parsed:   '',
                                        grading:  false,
                                        log:      []}),
        render:               render}); });
