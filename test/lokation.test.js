
'use strict';

var jsdom = require('jsdom');
var proxyquire = require('proxyquire');
var chai = require('chai');
var expect = require('chai').expect;
var sinonChai = require('sinon-chai');
var sinon = require('sinon');

chai.use(sinonChai);


describe('Lokation', function () {

  var window, Lokation, lokation;

  beforeEach(function () {
    global.document = jsdom.jsdom('<html><body></body></html>');
    window = document.defaultView;
    Lokation = proxyquire('../lokation', { 'global/window': window });
  });


  describe('#listen()', function () {

    it('should set "#html5" to `true` by default', function () {
      lokation = new Lokation();

      expect(lokation.html5).to.equal(true);
    });


    it('should set #html5 to `false` if passed on options', function () {
      lokation = new Lokation({ html5: false });

      expect(lokation.html5).to.equal(false);
    });


    it('should fallback from window.history', function () {
      var pushState = window.history.pushState;
      window.history.pushState = undefined;

      lokation = new Lokation();

      expect(lokation.html5).to.equal(false);
      window.history.pushState = pushState;
    });


    it('should ignore `true` html5 option without window.history', function () {
      var pushState = window.history.pushState;
      window.history.pushState = undefined;

      lokation = new Lokation({ html5: true });

      expect(lokation.html5).to.equal(false);
      window.history.pushState = pushState;
    });


    it('should add a `hashchange` listener with html5:false', function (done) {

      var addEventStub;

      jsdom.env({
        html: '<html><body></body></html>',
        loaded: function (err, window) {

          Lokation = proxyquire('../lokation', { 'global/window': window });
          addEventStub = sinon.stub(window, 'addEventListener');
          lokation = new Lokation({ html5: false });
          lokation.listen();

          expect(addEventStub.calledOnce).to.equal(true);
          expect(addEventStub).to.have.been.calledWith('hashchange');
          done();
        }
      });

    });


    it('should add a `popstate` listener with html5', function (done) {

      var addEventStub;

      jsdom.env({
        html: '<html><body></body></html>',
        loaded: function (err, window) {

          Lokation = proxyquire('../lokation', { 'global/window': window });
          addEventStub = sinon.stub(window, 'addEventListener');
          lokation = new Lokation();
          lokation.listen();

          expect(addEventStub.calledOnce).to.equal(true);
          expect(addEventStub).to.have.been.calledWith('popstate');
          done();
        }
      });

    });

  });


  describe('#_onHashChange(event)', function () {

    it('should emit the new hash', function () {
      var hashEvent, emitStub;

      hashEvent = new window.Event('hashchange');
      lokation = new Lokation();
      emitStub = sinon.stub(lokation, 'emit');
      hashEvent.newURL = 'www.example.com/#/hash';

      lokation._onHashChange(hashEvent);

      expect(emitStub.calledOnce).to.equal(true);
      expect(emitStub).to.have.been.calledWithExactly('urlchange', '/hash');
    });

  });


  describe('#_onPopState()', function () {

    it('should emit the new full path', function () {
      var emitStub;

      lokation = new Lokation();
      emitStub = sinon.stub(lokation, 'emit');
      window.location.href = 'http://www.example.com/full-path?and=query';

      lokation._onPopState();

      expect(emitStub.calledOnce).to.equal(true);
      expect(emitStub).to.have.been
        .calledWithExactly('urlchange', '/full-path?and=query');
    });

  });


  describe('EventEmitter.prototype', function () {

    it('should have EventEmitter instance methods', function () {
      lokation = new Lokation();

      expect(typeof lokation.emit).to.equal('function');
    });

  });


  describe('#_getHash(url)', function () {

    it('should retrieve the hash of the passed url', function () {
      lokation = new Lokation();

      var hash = lokation._getHash('example.com/#/hash');
      expect(hash).to.equal('/hash');
    });

  });


  describe('#_getFullPath()', function () {

    it('should retrieve the current location path', function () {
      window.location.href = 'example.com/path?to=query';
      window.location.hash = 'hash';
      lokation = new Lokation();

      var fullPath = lokation._getFullPath();

      expect(fullPath).to.equal('/path?to=query#hash');
    });

  });


  describe('#hash(urlHash)', function () {

    it('should set the url hash', function () {
      window.location.href = 'example.com/path';
      window.location.hash = 'foo';
      lokation = new Lokation();

      lokation.hash('bar');

      expect(window.location.hash).to.equal('#bar');
    });


    it('should get the url hash', function () {
      window.location.href = 'example.com/path';
      window.location.hash = 'baz';
      lokation = new Lokation();

      var urlHash = lokation.hash();
      expect(urlHash).to.equal('baz');
    });


  });

  describe('#get(urlPath)', function () {

    it('should return the full path if #html5 is true', function () {
      lokation = new Lokation();
      var fullPathStub = sinon.stub(lokation, '_getFullPath');
      var hashStub = sinon.stub(lokation, 'hash');

      lokation.url();

      expect(fullPathStub.calledOnce).to.equal(true);
      expect(hashStub.called).to.equal(false);
    });

    it('should return the hash if #html5 is false', function () {
      lokation = new Lokation({ html5: false });
      var fullPathStub = sinon.stub(lokation, '_getFullPath');
      var hashStub = sinon.stub(lokation, 'hash');

      lokation.url();

      expect(fullPathStub.called).to.equal(false);
      expect(hashStub.calledOnce).to.equal(true);
    });

    it('should set the hash if #html5 is false', function () {
      lokation = new Lokation({ html5: false });
      var fullPathStub = sinon.stub(lokation, '_setFullPath');
      var hashStub = sinon.stub(lokation, 'hash');

      lokation.url('/foo');

      expect(fullPathStub.called).to.equal(false);
      expect(hashStub.calledOnce).to.equal(true);
    });


    it('should set the hash if #html5 is false', function () {
      lokation = new Lokation();
      var fullPathStub = sinon.stub(lokation, '_setFullPath');
      var hashStub = sinon.stub(lokation, 'hash');

      lokation.url('/foo');

      expect(fullPathStub.calledOnce).to.equal(true);
      expect(hashStub.called).to.equal(false);
    });

  });


  describe('#_setFullPath(url)', function () {

    it('should call pushState on window.history and emit event', function () {
      lokation = new Lokation();
      var newUrl = '/foo/bar';
      var pushStateStub = sinon.spy(window.history, 'pushState');
      var emitStub = sinon.spy(lokation, 'emit');

      lokation._setFullPath(newUrl);

      expect(pushStateStub.calledOnce).to.equal(true);
      expect(pushStateStub).to.have.been.calledWithExactly({}, null, newUrl);

      expect(emitStub.calledOnce).to.equal(true);
      expect(emitStub).to.have.been.calledWithExactly('urlchange', '/foo/bar');
    });

  });


  describe('#replace(fullPath)', function () {

    it('should call replaceState and emit event', function () {
      lokation = new Lokation();
      var newUrl = '/foo/bar';
      var replaceStateStub = sinon.spy(window.history, 'replaceState');
      var emitStub = sinon.spy(lokation, 'emit');

      lokation.replace(newUrl);

      expect(replaceStateStub.calledOnce).to.equal(true);
      expect(replaceStateStub).to.have.been.calledWithExactly({}, null, newUrl);

      expect(emitStub.calledOnce).to.equal(true);
      expect(emitStub).to.have.been.calledWithExactly('urlchange', '/foo/bar');
    });


    it('should call location.replace with new hash', function () {
      lokation = new Lokation({ html5: false });
      var href = window.location.href = 'http://www.example.com';
      var newUrl = '/foo/bar';
      var replaced = href + '/#' + newUrl;
      var replaceStub = sinon.spy(window.location, 'replace');
      var emitStub = sinon.spy(lokation, 'emit');

      lokation.replace(newUrl);

      expect(replaceStub.calledOnce).to.equal(true);
      expect(replaceStub).to.have.been.calledWithExactly(replaced);

      expect(emitStub.calledOnce).to.equal(true);
      expect(emitStub).to.have.been.calledWithExactly('urlchange', '/foo/bar');
    });


    it('should call location.replace with different hash', function () {
      lokation = new Lokation({ html5: false });
      window.location.href = 'http://www.example.com';
      window.location.hash = '/about';
      var newUrl = '/contact';
      var replaced = 'http://www.example.com/#/contact';
      var replaceStub = sinon.spy(window.location, 'replace');
      var emitStub = sinon.spy(lokation, 'emit');

      lokation.replace(newUrl);

      expect(replaceStub.calledOnce).to.equal(true);
      expect(replaceStub).to.have.been.calledWithExactly(replaced);

      expect(emitStub.calledOnce).to.equal(true);
      expect(emitStub).to.have.been.calledWithExactly('urlchange', '/contact');
    });


  });


});