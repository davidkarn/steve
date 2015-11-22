define([
    'react/addons',
    'lodash'
], function (React, _) {
    'use strict';
    function repeatItem1(item, itemIndex) {
        return React.createElement('li', {}, '\n        ', item, '\n      ');
    }
    return function () {
        return React.createElement('div', {}, React.createElement('div', { 'className': 'main' }, React.createElement('h1', {}, 'Say Something'), React.createElement('h2', {}, this.state.message), React.createElement('button', { 'onClick': this.connect_with_canvas }, 'Connect with Canvas'), React.createElement('form', { 'onSubmit': this.run_message }, React.createElement('textarea', {
            'ref': 'input',
            'placeholder': 'or type something'
        }), React.createElement('input', { 'type': 'submit' })), React.createElement('p', {}, '\n      ', this.state.parsed, '\n    '), React.createElement.apply(this, [
            'ul',
            {},
            _.map(this.state.log, repeatItem1.bind(this))
        ])));
    };
});