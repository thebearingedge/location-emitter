
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

}

assign(Lokation.prototype, EventEmitter.prototype, {


  url: function (fullPath) {

    if (fullPath === undefined) {
      return this.html5 ? this._getFullPath() : this.hash();
    }
    else if (this.html5) {
      return this._setFullPath(fullPath);
    }
    else {
      return this.hash(fullPath);
    }

  },


  hash: function (urlHash) {

    if (urlHash === undefined) return this._getHash(this._getFullPath());

    window.location.hash = urlHash;

    return this;
  },


  replace: function (fullPath) {

    fullPath || (fullPath = this._getFullPath());

    if (this.html5) {

      window.history.replaceState({}, null, fullPath);

      this._onPopState();
    }
    else {

      var href = window.location.href;
      var hashIndex = href.indexOf('#');

      if (hashIndex > -1) {
        href = href.slice(0, hashIndex + 1) + fullPath;
      }
      else {
        href = href + '#' + fullPath;
      }

      window.location.replace(href);

      this._onHashChange({ newURL : href });
    }

    return this;
  },


  listen: function () {

    if (this.html5) {
      window.addEventListener('popstate', this._onPopState.bind(this));
    }
    else {
      window.addEventListener('hashchange', this._onHashChange.bind(this));
    }

    return this;
  },


  _getHash: function (url) {

    return url.slice(url.indexOf('#') + 1);
  },


  _getFullPath: function () {

    var location = window.location;

    return location.pathname + location.search + location.hash;
  },


  _setFullPath: function (fullPath) {

    window.history.pushState({}, null, fullPath);

    this.emit('urlchange', fullPath);

    return this;
  },


  _onHashChange: function (event) {

    var hash = this._getHash(event.newURL);

    this.emit('urlchange', hash);
  },


  _onPopState: function () {

    this.emit('urlchange', this._getFullPath());
  }


});