
'use strict';

var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var window = require('global/window');

module.exports = Lokation;

function Lokation(options) {

  this._initialize(options);

}

assign(Lokation.prototype, EventEmitter.prototype, {


  _initialize: function (options) {

    options || (options = {});

    var history = window.history || {};
    this.html5 = history.pushState && (options.html5 !== false) ? true : false;

  },


  hash: function () {
    return window.location.hash.slice(1);
  }


});