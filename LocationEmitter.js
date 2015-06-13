
'use strict';

var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var window = require('global/window');

module.exports = LocationEmitter;

function LocationEmitter(options) {

  options || (options = {});

  var history = window.history;

  this.html5 = history && history.pushState && (options.html5 !== false) ?
    true :
    false;

}

assign(LocationEmitter.prototype, EventEmitter.prototype, {

  listen: function () {

    if (this.html5) {
      window.addEventListener('popstate', this._onPopState.bind(this));
    }
    else {
      window.addEventListener('hashchange', this._onHashChange.bind(this));
    }

    return this;
  },


  url: function (fullPath) {

    if (fullPath === undefined) {
      return this.html5 ? this._getFullPath() : this.hash();
    }
    else {
      if (this.html5) {
        return this._setFullPath(fullPath);
      }
    }

    return this.hash(fullPath);
  },


  hash: function (urlHash) {

    var location = window.location;

    if (urlHash === undefined) {
      return location.hash ? location.hash.substr(1) : '';
    }

    location.hash = urlHash;

    return this;
  },


  replace: function (fullPath) {

    fullPath || (fullPath = this._getFullPath());

    if (this.html5) {

      window.history.replaceState({}, null, fullPath);

      return this._onPopState();
    }

    var location = window.location;
    var href = location.href;
    var hashIndex = href.indexOf('#');
    var hashMark = location.pathname === '/'
      ? '/#'
      : '#';

    if (hashIndex > -1) {
      href = href.slice(0, hashIndex) + hashMark + fullPath;
    }
    else {
      href = href + hashMark + fullPath;
    }

    location.replace(href);

    return this._onHashChange({ newURL : href });
  },


  _getFullPath: function () {

    var location = window.location;

    return location.pathname + location.search + location.hash;
  },


  _setFullPath: function (fullPath) {

    window.history.pushState({}, null, fullPath);

    return this._onPopState();
  },


  _onHashChange: function () {

    this.emit('urlchange', this.hash());

    return this;
  },


  _onPopState: function () {

    this.emit('urlchange', this._getFullPath());

    return this;
  }

});
