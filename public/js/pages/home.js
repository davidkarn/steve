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
            me.setState({said: said}); });
        annyang.debug();
        annyang.start({ autoRestart: true, continuous: false }); }

    
    function render() {
        return home_template.apply(this, arguments); }

    return React.createClass({
        displayName:         'home',
        go_to:                go_to,
        componentWillMount:   setup_annyang,
        getInitialState:      returner({message: ''}),
        render:               render}); });
