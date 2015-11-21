define(['react', 'lodash', 'react_router', 'pages/home', 'templates/home.rt'], function (React, _, Router, home, home_template) {
    'use strict';
    
    var app = React.createClass({
        render: function() {
            return React.createElement(Router.RouteHandler, null); }});

    var routes = {"":                         home,
                  "home":                     home};
    console.log(app, home, home_template);

    return {routes:       routes,
            bula:         home_template,
            landing:      home_template,
            app:          app}; });
            
