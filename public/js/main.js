var environments = {'hello-steve.herokuapp.com':   'staging',
                    'steve.com':                   'development'};
var environment  = environments[window.location.host];

if (environment == 'staging') {}
else {}

requirejs.config({
    paths: {
        lodash:          '//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min',
        react:           '/bower_components/react/react-with-addons',
        react_router:    '/bower_components/react-router/build/umd/ReactRouter',
        jquery:          '/bower_components/jquery/dist/jquery.min',
        jquery_ui:       '/bower_components/jquery-ui/jquery-ui.min',
        react_cookie:    '/bower_components/react-cookie/dist/react-cookie.min'
    },
    shim: {
        lodash: {exports: '_'},
        react: {exports: 'React'},
    },
    map: {
        '*': {
            'react/addons': 'react'
        }
    },
    baseUrl: '/js/'
});

requirejs(['react', 'react_router', 'view'], function (React, Router, view) {
    var Route    = Router.Route;

    function build_routes() {
        var args = [Route,
                    {handler: view.app, path: "/" }];
        for (var name in view.routes)
            args.push(React.createElement(Route,
                                          {name:      name,
                                           handler:   view.routes[name] }));
        return React.createElement.apply(React, args); }

    Router.run(build_routes(), function(Handler) {
        React.render(React.createElement(Handler, null),
                     document.querySelector("#steve-body")); }); });


