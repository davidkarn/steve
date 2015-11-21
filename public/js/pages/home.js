define(['react', 'lodash', 'templates/home.rt'], function (React, _, home_template) {
    'use strict';

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

    function run_message(e) {
        var me = this;
        e.preventDefault();
        var message = ref_value(this.refs.input);

        $.ajax({type: 'post',
                url: '/api/v1/parse',
                data: {messages: [message]},
                success: function(response) {
                   console.log(response);
                   me.setState({parsed: JSON.stringify(response)}); },
                error: function(x) {
                    console.log(x); }}); }
            
    function render() {
        return home_template.apply(this, arguments); }

    return React.createClass({
        displayName:         'home',
        go_to:                go_to,
        run_message:          run_message,
        componentWillMount:   setup_annyang,
        getInitialState:      returner({message: '', parsed: ''}),
        render:               render}); });
