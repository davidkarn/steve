define(['react', 'lodash', 'templates/home.rt'], function (React, _, home_template) {
    'use strict';
    var speech         = new p5.Speech();
    var courses        = [];
    var assignments    = [];
    var users          = [];
    var dictating      = false;

    function init_moodle() {
        get_courses(); }

    function complete_dictation() {
        var note = this.state.note;

        call_moodle('add_note', {notes: [{
            userid: user_id,
            publishstate: 'course',
            courseid: course_id,
            text: note,
            format: 2}]}); 
        
        this.add_log('Dicated: "' + note + '" for ' + this.state.dictating + ' in ' + this.state.course);
        this.setState({note: '', dictating: false, course: false}); }

    function update_grade(user, assignment, grade, next) {
        call_moodle("save_grade",
                    {assignmentid:     assignment.id,
                     userid:           user.id,
                     grade:            grade,
                     attemptnumber:    1,
                     addattempt:       0,
                     workflowstate:   "graded",
                     applytoall:       0,
                     plugindata:      {assignfeedbackcomments_editor:  {text:   "update from steve",
                                                                        format:  0},
                                       files_filemanager:0}},
                    next || do_nothing); }
    
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
        annyang.start({ autoRestart: false }); }

    function speak(text) {
        speech.setVoice('Google UK English Male');
        return speech.speak(text); }

    function add_log(message) {
        this.setState({log: [message].concat(this.state.log)}); }
    
    function process_part(part) {
        if (part.steve_did) {
            this.add_log(part.steve_did);
            speak(part.steve_did); }

        if (part.command == 'start_grading') 
            this.setState({grading: part.params.for || "."});

        if (part.command == 'enter_course') 
            this.setState({course: part.params.for || "."});
        console.log('part', part, part.command, this.state, this.state.note);
        if (part.command == 'finished')
            if (this.state.dictating)
                this.complete_dictation();
        if (!part.command && this.state.dictating) 
            this.setState({note: this.state.note + part.sentance.join(' ') + '. '});

        if (part.command == 'dictate_note') 
            this.setState({dictating: part.params.for || "."});

        if (part.command == 'update_grade')
            update_grade(lookup_student(part.params.student),
                         lookup_assignment(this.state.grading),
                         (part.params.score / (part.params.out_of || 100)));
        
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
                       dictating:    this.state.dictating,
                       course:       this.state.course,
                       courses:      course_names(),
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
        if (image.src.match("images/steve-logo.png"))
            image.src = "images/steve-logo-recording-with-mic.png";
        else 
            image.src = "images/steve-logo.png"; }

    function render() {
        return home_template.apply(this, arguments); }

    init_moodle();
    
    return React.createClass({
        displayName:         'home',
        go_to:                go_to,
        process_part:         process_part,
        changeImage:          changeImage,
        start:                annyang.start,
        post_message:         post_message,
        add_log:              add_log,
        run_message:          run_message,
        connect_with_canvas:  connect_with_canvas,
        componentWillMount:   setup_annyang,
        complete_dictation:   complete_dictation,
        getInitialState:      returner({message:     '',
                                        parsed:      '',
                                        grading:     false,
                                        dictating:   false,
                                        course:      false,
                                        note:        '',
                                        log:         []}),
        render:               render}); });
