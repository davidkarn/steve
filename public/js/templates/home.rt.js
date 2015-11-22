define([
    'react/addons',
    'lodash'
], function (React, _) {
    'use strict';
    function repeatItem1(item, itemIndex) {
        return React.createElement('li', {
            'style': {
                listStyle: 'none',
                textIndent: 'none'
            }
        }, '\n          ', item, '\n        ');
    }
    return function () {
        return React.createElement('div', {}, React.createElement('div', { 'className': 'wrap' }, React.createElement('header', {}, React.createElement('div', {
            'className': 'dropdown',
            'style': { float: 'right' }
        }, React.createElement('button', {
            'className': 'btn btn-primary dropdown-toggle',
            'type': 'button',
            'data-toggle': 'dropdown',
            'style': {
                background: 'none',
                border: '0',
                boxShadow: 'none',
                fontSize: '2em',
                color: '#333',
                opacity: '0.6'
            }
        }, React.createElement('i', { 'className': 'fa fa-bars' })), React.createElement('ul', { 'className': 'dropdown-menu' }, React.createElement('li', {}, React.createElement('a', { 'href': '#' }, 'HTML')), React.createElement('li', {}, React.createElement('a', { 'href': '#' }, 'CSS')), React.createElement('li', {}, React.createElement('a', { 'href': '#' }, 'JavaScript')))), React.createElement('br', {}), React.createElement('br', {}), React.createElement('div', {
            'className': 'logo',
            'style': { textAlign: 'center' }
        }, React.createElement('div', {
            'id': 'myImage',
            'style': {
                backgroundColor: '#223355',
                display: 'inline-block',
                borderRadius: '50px',
                width: '100px',
                color: '#ddd',
                height: '100px',
                opacity: '0.7',
                verticalAlign: 'center',
                paddingTop: '25px',
                fontSize: '35px'
            },
            'onClick': this.start,
            'onMouseDown': this.changeImage
        }, React.createElement('i', { 'className': 'fa fa-microphone' })), React.createElement('span', {
            'className': 'title',
            'style': {
                textIndent: '-50px',
                marginTop: '20px'
            }
        }, React.createElement('span', {}, '\u201Cok '), 'steve\u201D'), React.createElement('br', {}), React.createElement('br', {}), React.createElement('div', {
            'style': {
                width: '400px',
                textAlign: 'left',
                margin: 'auto'
            }
        }, this.state.grading ? React.createElement('div', {}, '\n            Grading ', this.state.grading, '\n          ') : null, React.createElement.apply(this, [
            'ul',
            {
                'style': {
                    fontSize: '1.5em',
                    padding: '0'
                }
            },
            _.map(this.state.log, repeatItem1.bind(this))
        ]))))), React.createElement('div', {}, React.createElement('div', { 'className': 'main' }, React.createElement('h1', {}, 'Say Something'), React.createElement('h2', {}, this.state.message), React.createElement('button', { 'onClick': this.connect_with_canvas }, 'Connect with Canvas'), React.createElement('form', { 'onSubmit': this.run_message }, React.createElement('textarea', {
            'ref': 'input',
            'placeholder': 'or type something'
        }), React.createElement('input', { 'type': 'submit' })), React.createElement('p', {}, '\n        ', this.state.parsed, '\n      '))));
    };
});