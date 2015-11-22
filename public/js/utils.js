function param_caller(param) {
    return function(o) {
        return o[param](); }; }

function remove_element(element) {
    if (element && element.parentNode)
        element.parentNode.removeChild(element); }

function get_option(key) {
    return get_options()[key]; }

function set_option(key, value) {
    var options = get_options();
    options[key] = value;
    set_options(options);
    return value; }

function get_options() {        
    if (!localStorage['settings'])
        return {};
    return JSON.parse(localStorage['settings']); }

function set_options(options) {
    return localStorage['settings'] = JSON.stringify(options); }

function concat(a1, a2) {
    return a1.concat(a2); }

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

function param_tester(key, value) {
    return function(obj) {
        return obj[key] == value; }; }

function tester(value) {
    return function(v) {
        return v == value; }; }

function not_tester(value) {
    return function(v) {
        return v != value; }; }

function clone(i) {
    if (i instanceof Array)
        return i.slice(o);

    if (typeof i != "object")
        return i;
    
    var o = {};
    for (var j in i) 
        o[j] = clone(i[j]); 
    return o; }
        
function http(method, url, data, success, fail) {
    var xmlhttp = new XMLHttpRequest;
    if (typeof data == "object")
        data = obj_to_urlstring(data); 

    xmlhttp.open((method || 'get'), url + '?' + data, true);
//    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
//    xmlhttp.setRequestHeader("Origin", window.location.href);
    xmlhttp.onreadystatechange = function() {
        if(xmlhttp.readyState == 4 ){
            if(xmlhttp.status == 200){
                success(xmlhttp.responseText); }
            else
                fail(xmlhttp.responseText); }};
        

    xmlhttp.send(data ? data : null); }


function obj_to_urlstring(obj) {
    var strs = [];

    for (var key in obj)
        strs.push(key + "=" + encodeURIComponent(obj[key]));

    return strs.join("&"); }

function do_nothing() {}

function sel(sel, el) {
    return (el || document).querySelector(sel); }

function sel_all(sel, el) {
    return to_array((el || document).querySelectorAll(sel)); }

function o(fna, fnb) {
    return function(arg) {
        fna(fnb(arg)); }; }

function member(ar, value) {
    return ar.indexOf(value) >= 0; }

function object_matches(obj, pattern) {
    for (var i in pattern)
        if (obj[i] != pattern[i])
            return false;
    return true; }

function set_styles(el, styles) {
    for (var i in styles) 
        el.style[i] = styles[i];
    return el; }


function set_attributes(el, attrs) {
    for (var key in attrs) 
        el.setAttribute(key, attrs[key]);
    return el; }

function set_styles(el, attrs) {
    for (var key in attrs) 
        el.style[key] = attrs[key];

    return el; }

function add_style(css) {
  var head = document.getElementsByTagName('head')[0];
  if (!head) 
      head = document.body;

  var style = document.createElement('style'); 
  style.type = 'text/css';
  if (style.styleSheet) 
    style.styleSheet.cssText = css;
  else
    style.appendChild(document.createTextNode(css)); 

  head.appendChild(style); }

function get_offset(el, addto) {
    var offset = {top: el.offsetTop,
                  left: el.offsetLeft};

    if (addto) {
        offset.top += addto.top;
        offset.left += addto.left; }

    if (!el.offsetParent)
        return offset;

    return get_offset(el.offsetParent, offset); }

function get_bounds(el) {
    var offset = get_offset(el);
    var bounds = el.getBoundingClientRect();
    
    offset.width = bounds.width;
    offset.height = bounds.height; 

    return offset; }
    
function create_element(tag_name, attributes, inner_html) {
    var tag = document.createElement(tag_name);
    set_attributes(tag, attributes);
    tag.innerHTML = inner_html || ''; 
    return tag; }
        
function create_text(text) {
    return document.createTextNode(text); }

function go_to(path) {
  window.location.hash = "#" + path; }

function returner(x) {
  return function() {
    return x; }; }

function random_id(length) {
    var text     = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i=0; i < (length || 16); i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text; }

function print(x) {
    console.log(x); }

function print_err(x) {
    console.log('error', x); }


function lookup_gravatar(email, size, default_url, user) {
    var hash = md5(email.toString().trim().toLowerCase());
    size = size || 50;

    return 'https://www.gravatar.com/avatar/' + hash
        + '&s=' + size.toString(); }

function lookup_gravatar_list(emails, size, default_url, user) {
    uniq(emails).slice(0,3).reverse().map(function(email) {
        if (email)
            url = lookup_gravatar(email, size); });
    return url; }

function extractor(key) {
    return function(d, i) {
	return d[key]; }}


function uniq(ar) {
    var found = [];

    for (var i in ar)
        if (found.indexOf(ar[i]) < 0)
            found.push(ar[i]);

    return found; }



function hash(obj) {
    if (typeof obj != "string")
        obj = JSON.stringify(obj); 
    var hash = 0, i, chr, len;
    if (obj.length == 0) return hash;
    for (i = 0, len = obj.length; i < len; i++) {
        chr   = obj.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer 
  }
  return hash;
}

function values(ar) {
    var ret = [];
    for (var i in ar)
        ret.push(ar[i]);
    return ret; }

function overlaps(list1, list2) {
    for (var i in list1)
        for (var j in list2)
            if (list1[i] == list2[j])
                return true;
    return false; }

function keys_set(array) {
    var ret = [];
    for (var key in array)
        if (array[key]) ret.push(key);
    return ret; }

function toast(type, message) {
    toastr.options = {
	"closeButton": true,
	"debug": false,
	"positionClass": "toast-bottom-right",
	"onclick": null,
	"showDuration": "300",
	"hideDuration": "1000",
	"timeOut": "5000",
	"extendedTimeOut": "1000",
	"showEasing": "swing",
	"hideEasing": "linear",
	"showMethod": "fadeIn",
	"hideMethod": "fadeOut"
    }

    toastr[type](message); }


function sort_sections(sections, fieldname) {
    var list =  values(sections).map(function (section) {
        section[fieldname].sort(function(c1, c2) {
            return (c1 < c2 ? -1 : (c1 == c2 ? 0 : 1)); });
        return section; });
    
    list.sort(function(section1, section2) {
        return section1.letter < section2.letter ? -1 : 1; });
    
    return list.filter(extractor('letter')); }


function parse_file_on_change(input, next) {
    if (!$(input)[0].files[0]) return next(undefined);
    var reader = new FileReader();

    reader.onload = function(e) {
        next(new Parse.File($(input)[0].files[0].name,
                            {base64: btoa(e.target.result)})); };

    reader.readAsBinaryString($(input)[0].files[0]); }

function ref_checked(ref) {
    return ref.getDOMNode().checked; }

function ref_value(ref) {
    return ref.getDOMNode().value; }

function ref_set_checked(ref, value) {
    return ref.getDOMNode().checked = value; }

function ref_set_value(ref, value) {
    return ref.getDOMNode().value = value || ""; }

function ref_set_image(ref, image) {
    if (image)
        return ref.getDOMNode().src = image.url(); }

function ref_inner_html(ref) {
    return ref.getDOMNode().innerHTML; }

function ref_set_html(ref, html) {
    return ref.getDOMNode().innerHTML = html; }

function ref_set_src(ref, val) {
    return $(ref.getDOMNode()).attr('src', val); }


function success(next) {
    return {success: next || do_nothing, error: print_err}; }

function in_sequence(callbacks, next) {
    function go() {
        var callback = callbacks.shift();
        
        if (!callback)      (next || do_nothing)();
        else                callback(go); }

    go(); }

function inject_into(obj1, obj2) {
    for (var i in obj2)         
        obj1[i] = obj2[i];
    return obj1; }

function view_contact(contact) {
    go_to('/profile/view/' + contact.id); }

function object_in_list(object, list) {
    for (var i in list) 
        if (list[i].id == object.id)
            return true;
    return false; }

function joiner(a1, a2) {
    return a1.concat(a2); }
