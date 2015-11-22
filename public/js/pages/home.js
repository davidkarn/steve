define(['react', 'lodash', 'templates/home.rt'], function (React, _, home_template) {
    'use strict';
    var speech         = new p5.Speech();
    var courses        = [];
    var assignments    = [];
    var users          = [];
    var dictating      = false;
    var mic_is_on      = false;

    function mobile_check() {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
        return check; }

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
            me.post_message(said[0], said); });
        annyang.addCallback('end', function() {
            turn_off_mic();
        });
    }

    function speak(text) {
        speech.setVoice('Google UK English Male');
        return speech.speak(text); }

    function add_log(message) {
        this.setState({log: [message]}); }
//        this.setState({log: [message].concat(this.state.log)}); }

    function process_part(part) {
        if (part.steve_did) {
            this.add_log(part.steve_did);
            speak(part.steve_did); }

        if (part.command == 'start_grading') 
            this.setState({grading: part.params.for || "."});

        if (part.command == 'enter_course') 
            this.setState({course: part.params.for || "."});

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
                         (100 * (part.params.score / (part.params.out_of || 100))));
        
        if (part.command == 'stop_grading') 
            this.setState({grading: false}); }

    function connect_with_canvas() {
        window.location.href = ('/auth/canvas'); }

    function run_message(e) {
        var me = this;
        e.preventDefault();
        var message = ref_value(this.refs.input);

        this.post_message(message); }

    function post_message(message, messages) {
        var me = this;
        $.ajax({type: 'post',
                url: '/api/v1/parse',
                data: {messages:    (messages || [message]),
                       dictating:    this.state.dictating,
                       course:       this.state.course,
                       courses:      course_names(),
                       students:     student_names(),
                       assignments:  assignment_names()},
                success: function(response) {
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
            
    function turn_on_mic() {
        // for some reason we seem to get this event too many times.

        if (!mic_is_on) {
            if (mobile_check()) {
                $("#logo").hide();
                $("#logo_mic").show();
                $('.mic_image').addClass('mic_on'); }
            else {
                $("#logo").fadeOut(600);
                $("#logo_mic").fadeIn(600, function() {
                    $('.mic_image').addClass('mic_on'); }); }

            annyang.start({autoRestart: false, continuous: false});
            mic_is_on = true;
        }
    }

    function turn_off_mic() {
        if (mic_is_on) {
            if (mobile_check()) {
                $("#logo").show();
                $("#logo_mic").hide();
                $('.mic_image').removeClass('mic_on'); }
            else {
                $("#logo").fadeIn(600);
                $("#logo_mic").fadeOut(600, function() {
                    $('.mic_image').removeClass('mic_on'); }); }

            annyang.abort();
            mic_is_on = false;
        }
    }

    function toggle_mic() {
        if (mic_is_on) {
            turn_off_mic();
        } else {
            turn_on_mic();
        }
    }

    function render() {
        return home_template.apply(this, arguments); }

    init_moodle();
    
    return React.createClass({
        displayName:         'home',
        go_to:                go_to,
        process_part:         process_part,
        toggle_mic:           toggle_mic,
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
                                        mic_image:   'images/steve-logo.png',
                                        mic_class:   '',
                                        dictating:   false,
                                        course:      false,
                                        note:        '',
                                        log:         []}),
        render:               render}); });
