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
        }, '\n            ', item, '\n          ');
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
        }, React.createElement('img', {
            'src': 'images/steve-logo.png',
            'className': 'mic_on',
            'id': 'logo',
            'onClick': this.toggle_mic
        }), React.createElement('img', {
            'src': 'images/steve-logo-recording-with-mic.png',
            'className': 'mic_on',
            'id': 'logo_mic',
            'onClick': this.toggle_mic
        })), React.createElement('span', {
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
        }, this.state.grading ? React.createElement('div', {}, '\n          Grading: ', this.state.grading, '\n        ') : null, this.state.course ? React.createElement('div', {}, '\n          Course: ', this.state.course, this.state.dictating ? React.createElement('span', {}, ', \n          dictating for ', this.state.dictating, '\n          ') : null, React.createElement('p', {}, '\n            ', this.state.note, '\n          ')) : null, React.createElement.apply(this, [
            'ul',
            {
                'style': {
                    fontSize: '1.5em',
                    padding: '0'
                }
            },
            _.map(this.state.log, repeatItem1.bind(this))
        ])))));
    };
});