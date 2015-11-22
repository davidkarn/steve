define(['react', 'lodash', 'templates/home.rt'], function (React, _, home_template) {
    'use strict';
    var speech         = new p5.Speech();
    var courses        = [];
    var assignments    = [];
    var users          = [];

    function init_moodle() {
        get_courses(); }

    function get_courses(next) {
        call_moodle('get_courses', {}, function(r) {
            courses = r;
            console.log('courses', courses);
            get_assignments(); }); }

    function get_assignments() {
            call_moodle('get_assignments', {}, function(r) {
                assignments = r.courses.map(extractor('assignments')).reduce(joiner);
                console.log('assignments', r);
                get_users(); }); }
            
    function get_users() {
        courses.map(function(course) {
            call_moodle('get_users', {courseid: course.id}, function(r) {
                course.users = r;
                console.log('users', r); }); }); }

    function student_names() {
        return courses.map(extractor('users'))
            .reduce(joiner)
            .map(extractor('fullname')); }

    function assignment_names() {
        return assignments.map(extractor('name')); }

    function course_names() {
        return courses.map(extractor('fullname')); }

    function lookup_assignment(name) {
        for (var i in assignments) {
            if (assignments[i].name == name)  
                return assignments[i]; }
        return false; }

    function lookup_student(name) {
        for (var i in courses) {
            for (var j in courses[i].users)
                if (courses[i].users[j].fullname == name)
                    return courses[i].users[j]; }
        return false; }

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
        annyang.debug();
        annyang.addCommands(commands);
        annyang.addCallback('result', function (said) {
            me.post_message(said[0]); });
        annyang.start({ autoRestart: true, continuous: false }); } }

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
                data: {messages:    [message],
                       students:     student_names(),
                       assignments:  assignment_names()},
                success: function(response) {
                    console.log(response);
                    response.map(me.process_part);
                   me.setState({parsed: response[0].sentance.join(" ")}); },
                error: function(x) {
                    console.log(x); }}); }
            
    function call_moodle(command, params, next) {
        var me = this;
        $.ajax({type: 'post',
                url: '/api/v1/moodle',
                data: {command:  command,
                       params:   params},
                success: function(response) {
                    console.log(response);
                    next(response); },
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

    init_moodle();
    
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
