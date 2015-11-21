define([
    'react/addons',
    'lodash'
], function (React, _) {
    'use strict';
    function repeatItem1(item, itemIndex) {
        return React.createElement('li', {}, '\n        ', item, '\n      ');
    }
    return function () {
        return React.createElement('div', {}, React.createElement('div', { 'className': 'main' }, React.createElement('h1', {}, 'Say Something'), React.createElement('h2', {}, this.state.message), React.createElement.apply(this, [
            'ul',
            {},
            _.map(this.state.said, repeatItem1.bind(this))
        ])));
    };
});