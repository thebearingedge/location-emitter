
'use strict';

var window = require('global/window');


module.exports = LocationEmitter;


function LocationEmitter(options) {

  options || (options = {});

  var history = window.history;

  this.html5 = history && history.pushState && (options.html5 !== false)
    ? true
    : false;

  this._subscribers = [];
  this._listening = false;

}


LocationEmitter.prototype.listen = function listen() {

  if (this._listening) return;

  var eventType, listener;

  if (this.html5) {
    eventType = 'popstate';
    listener = this._onPopState;
  }
  else {
    eventType = 'hashchange';
    listener = this._onHashChange;
  }

  window.addEventListener(eventType, listener.bind(this));

  this._emit(this.url());
  this._listening = true;

  return this;
};


LocationEmitter.prototype.url = function url(fullPath) {

  if (fullPath === undefined) {
    return this.html5
      ? this._getFullPath()
      : this.hash();
  }
  else if (this.html5){
    return this._setFullPath(fullPath);
  }

  return this.hash(fullPath);
};


LocationEmitter.prototype.hash = function hash(urlHash) {

  var location = window.location;

  if (urlHash === undefined) {
    return location.hash
      ? location.hash.substr(1)
      : '';
  }

  location.hash = urlHash;

  return this;
};


LocationEmitter.prototype.replace = function replace(fullPath) {

  if (this.html5) {

    fullPath || (fullPath = this._getFullPath());

    return this._replaceState(fullPath);
  }

  fullPath || (fullPath = this.hash() || '/');

  var location = window.location;

  var current, currentHashIndex, currentHasHash, href;

  current = location.href;
  currentHashIndex = current.indexOf('#');
  currentHasHash = currentHashIndex !== -1;

  if (currentHasHash) {
    href = current.slice(0, currentHashIndex) + '#' + fullPath;
  }
  else {
    href = current[current.length - 1] !== '/'
      ? current + '/#' + fullPath
      : current + '#' + fullPath;
  }

  location.replace(href);

  return this;
};


LocationEmitter.prototype.onChange = function onChange(subscriber) {

  this._subscribers.push(subscriber);

  return function unsubscribe() {

    var remaining = [];
    var l = this._subscribers.length;

    while (l--) {
      if (this._subscribers[l] !== subscriber) {
        remaining.push(this._subscribers[l]);
      }
    }

    this._subscribers = remaining;
  }.bind(this);
};


LocationEmitter.prototype._getFullPath = function _getFullPath() {

  var location = window.location;

  return location.pathname + location.search + location.hash;
};


LocationEmitter.prototype._setFullPath = function _setFullPath(fullPath) {

  window.history.pushState({}, null, fullPath);

  this._onPopState();

  return this;
};


LocationEmitter.prototype._onHashChange = function _onHashChange() {

  if (this._listening) this._emit(this.hash());
};


LocationEmitter.prototype._onPopState = function _onPopState() {

  if (this._listening) this._emit(this._getFullPath());
};


LocationEmitter.prototype._replaceState = function _replaceState(fullPath) {

  window.history.replaceState({}, null, fullPath);

  this._onPopState();

  return this;
};


LocationEmitter.prototype._emit = function _emit(path) {

  var l = this._subscribers.length;

  while (l--) {
    this._subscribers[l](path);
  }
};
