/**
 * Created by ez on 11/22/15.
 */


function populateTable(items) {
    console.log(items);
    $.each(items, function(i, item) {
        var tr = $('<tr>');
        var td = $('<td>').text(item.firstname + " " + item.lastname);
        var td2 = $('<td>').text("---").attr("id", "user"+item.id);
        td.appendTo(tr);
        td2.appendTo(tr);
        tr.appendTo('#records_table');
        console.log(item);
    });
}


function updateGrades() {
    $(document).ready(function () {
        xhrRequest = jQuery.ajax("http://canvas.emanuelzephir.com/moodle/webservice/rest/server.php?" +
            "wstoken=d962f2897bb81c6294e8637d6c6047b2&"+
            "wsfunction=mod_assign_get_grades&"+
            "moodlewsrestformat=json&"+
            "assignmentids[0]=4").done(function (items) {
            console.log(items);
            console.log(items.assignments[0].grades);
            updateGradeRows(items.assignments[0].grades);
            setTimeout(updateGrades, 5000);
        });
    });
    jQuery.ajax()
}


function updateGradeRows(items) {
    $.each(items, function(i, item) {
        if (Math.round(item.grade) == 0) {
            $('#user'+ item.userid).html("---");
        } else {
            $('#user'+ item.userid).html(
                Math.round(item.grade).toString() + " / 100");
        }


        console.log(item);
    });
}