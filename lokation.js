
'use strict';

var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var window = require('global/window');

module.exports = Lokation;

function Lokation(options) {

  options || (options = {});

  var history = window.history;
  this.html5 = history && history.pushState && (options.html5 !== false) ?
    true :
    false;

  if (this.html5) {
    window.addEventListener('popstate', this._onPopState.bind(this));
  }
  else {
    window.addEventListener('hashchange', this._onHashChange.bind(this));
  }

}

assign(Lokation.prototype, EventEmitter.prototype, {


  _getHash: function (url) {

    return url.slice(url.indexOf('#') + 1);
  },


  _getFullPath: function () {

    var location = window.location;

    return location.pathname + location.search + location.hash;
  },


  _onHashChange: function (event) {

    var hash = this._getHash(event.newURL);

    this.emit('urlchange', hash);
  },


  _onPopState: function () {

    var fullPath = this._getFullPath();

    this.emit('urlchange', fullPath);
  }


});