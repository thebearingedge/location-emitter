
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


});