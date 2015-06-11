
'use strict';

var jsdom = require('jsdom');
var proxyquire = require('proxyquire');
var chai = require('chai');
var expect = require('chai').expect;
var sinonChai = require('sinon-chai');
var sinon = require('sinon');

chai.use(sinonChai);


describe('LocationEmitter', function () {

  var window, LocationEmitter, le;

  beforeEach(function () {
    window = jsdom.jsdom('<html><body></body></html>').defaultView;
    LocationEmitter = proxyquire('../LocationEmitter', {
      'global/window': window
    });
  });


  it('should set html5 to `true` by default', function () {
    le = new LocationEmitter();

    expect(le.html5).to.equal(true);
  });


  it('should set html5 to `false` if passed on options', function () {
    le = new LocationEmitter({ html5: false });

    expect(le.html5).to.equal(false);
  });


  it('should fallback html5 without window.history', function () {
    window.history.pushState = undefined;

    le = new LocationEmitter();

    expect(le.html5).to.equal(false);
  });


  it('should ignore html5 option without window.history', function () {
    window.history.pushState = undefined;

    le = new LocationEmitter({ html5: true });

    expect(le.html5).to.equal(false);
  });


  describe('EventEmitter.prototype', function () {

    it('should have EventEmitter instance methods', function () {
      le = new LocationEmitter();

      expect(typeof le.emit).to.equal('function');
      expect(typeof le.on).to.equal('function');
    });

  });


  describe('#listen()', function () {

    it('should add a `hashchange` listener if html5 is false', function (done) {

      var addEventStub;

      jsdom.env({
        html: '<html><body></body></html>',
        loaded: function (err, window) {

          LocationEmitter = proxyquire('../LocationEmitter', {
            'global/window': window
          });
          addEventStub = sinon.stub(window, 'addEventListener');
          le = new LocationEmitter({ html5: false });
          le.listen();

          expect(addEventStub.calledOnce).to.equal(true);
          expect(addEventStub).to.have.been.calledWith('hashchange');
          done();
        }
      });

    });


    it('should add a `popstate` listener if html5 is true', function (done) {

      var addEventStub;

      jsdom.env({
        html: '<html><body></body></html>',
        loaded: function (err, window) {

          LocationEmitter = proxyquire('../LocationEmitter', {
            'global/window': window
          });
          addEventStub = sinon.stub(window, 'addEventListener');
          le = new LocationEmitter();
          le.listen();

          expect(addEventStub.calledOnce).to.equal(true);
          expect(addEventStub).to.have.been.calledWith('popstate');
          done();
        }
      });

    });

  });


  describe('#url(urlPath)', function () {

    it('should return the full path if #html5 is true', function () {
      le = new LocationEmitter();
      var fullPathStub = sinon.stub(le, '_getFullPath');
      var hashStub = sinon.stub(le, 'hash');

      le.url();

      expect(fullPathStub.calledOnce).to.equal(true);
      expect(hashStub.called).to.equal(false);
    });


    it('should return the hash if #html5 is false', function () {
      le = new LocationEmitter({ html5: false });
      var fullPathStub = sinon.stub(le, '_getFullPath');
      var hashStub = sinon.stub(le, 'hash');

      le.url();

      expect(fullPathStub.called).to.equal(false);
      expect(hashStub.calledOnce).to.equal(true);
    });


    it('should set the hash if #html5 is false', function () {
      le = new LocationEmitter({ html5: false });
      var fullPathStub = sinon.stub(le, '_setFullPath');
      var hashStub = sinon.stub(le, 'hash');

      le.url('/foo');

      expect(fullPathStub.called).to.equal(false);
      expect(hashStub.calledOnce).to.equal(true);
    });


    it('should set the hash if #html5 is false', function () {
      le = new LocationEmitter();
      var fullPathStub = sinon.stub(le, '_setFullPath');
      var hashStub = sinon.stub(le, 'hash');

      le.url('/foo');

      expect(fullPathStub.calledOnce).to.equal(true);
      expect(hashStub.called).to.equal(false);
    });

  });


  describe('#hash(urlHash)', function () {

    it('should set the url hash', function () {
      window.location.href = 'example.com/path';
      window.location.hash = 'foo';
      le = new LocationEmitter();

      le.hash('bar');

      expect(window.location.hash).to.equal('#bar');
    });


    it('should get the url hash', function () {
      window.location.href = 'example.com/path';
      window.location.hash = 'baz';
      le = new LocationEmitter();

      var urlHash = le.hash();
      expect(urlHash).to.equal('baz');
    });

  });


  describe('#replace(fullPath)', function () {

    it('should default to the current full path', function () {
      le = new LocationEmitter();
      var fullPathSpy = sinon.spy(le, '_getFullPath');
      sinon.stub(le, '_onPopState');

      le.replace();

      expect(fullPathSpy.calledOnce).to.equal(true);
      expect(fullPathSpy).to.have.been.calledWithExactly();
    });


    it('should call `history.replaceState` and emit event', function () {
      le = new LocationEmitter();
      var newUrl = '/foo/bar';
      var replaceStateStub = sinon.stub(window.history, 'replaceState');
      var onPopStub = sinon.stub(le, '_onPopState');

      le.replace(newUrl);

      expect(replaceStateStub.calledOnce).to.equal(true);
      expect(replaceStateStub).to.have.been.calledWithExactly({}, null, newUrl);

      expect(onPopStub.calledOnce).to.equal(true);
    });


    it('should call `location.replace` with hash and emit change', function () {
      le = new LocationEmitter({ html5: false });
      var href = window.location.href = 'http://www.example.com';
      var newUrl = '/foo/bar';
      var replaced = href + '/#' + newUrl;
      var replaceStub = sinon.spy(window.location, 'replace');
      var emitStub = sinon.spy(le, 'emit');

      le.replace(newUrl);

      expect(replaceStub.calledOnce).to.equal(true);
      expect(replaceStub).to.have.been.calledWithExactly(replaced);

      expect(emitStub.calledOnce).to.equal(true);
      expect(emitStub).to.have.been.calledWithExactly('urlchange', '/foo/bar');
    });


    it('should call `location.replace` new hash and emit change', function () {
      le = new LocationEmitter({ html5: false });
      window.location.href = 'http://www.example.com';
      window.location.hash = '/about';
      var newUrl = '/contact';
      var replaced = 'http://www.example.com/#/contact';
      var replaceStub = sinon.spy(window.location, 'replace');
      var emitStub = sinon.spy(le, 'emit');

      le.replace(newUrl);

      expect(replaceStub.calledOnce).to.equal(true);
      expect(replaceStub).to.have.been.calledWithExactly(replaced);

      expect(emitStub.calledOnce).to.equal(true);
      expect(emitStub).to.have.been.calledWithExactly('urlchange', '/contact');
    });

  });


  describe('#_getHash(url)', function () {

    it('should retrieve the hash of the passed url', function () {
      le = new LocationEmitter();

      var hash = le._getHash('example.com/#/hash');
      expect(hash).to.equal('/hash');
    });

  });


  describe('#_getFullPath()', function () {

    it('should retrieve the current location path', function () {
      window.location.href = 'example.com/path?to=query';
      window.location.hash = 'hash';
      le = new LocationEmitter();

      var fullPath = le._getFullPath();

      expect(fullPath).to.equal('/path?to=query#hash');
    });

  });


  describe('#_setFullPath(url)', function () {

    it('should call pushState on window.history and emit event', function () {
      le = new LocationEmitter();
      var newUrl = '/foo/bar';
      var pushStateStub = sinon.spy(window.history, 'pushState');
      var emitStub = sinon.spy(le, 'emit');

      le._setFullPath(newUrl);

      expect(pushStateStub.calledOnce).to.equal(true);
      expect(pushStateStub).to.have.been.calledWithExactly({}, null, newUrl);

      expect(emitStub.calledOnce).to.equal(true);
      expect(emitStub).to.have.been.calledWithExactly('urlchange', '/foo/bar');
    });

  });


  describe('#_onHashChange(event)', function () {

    it('should emit the new hash fragment', function () {
      var hashEvent, emitStub;

      hashEvent = new window.Event('hashchange');
      le = new LocationEmitter();
      emitStub = sinon.stub(le, 'emit');
      hashEvent.newURL = 'www.example.com/#/hash';

      le._onHashChange(hashEvent);

      expect(emitStub.calledOnce).to.equal(true);
      expect(emitStub).to.have.been.calledWithExactly('urlchange', '/hash');
    });

  });


  describe('#_onPopState()', function () {

    it('should emit the new full path', function () {
      var emitStub;

      le = new LocationEmitter();
      emitStub = sinon.stub(le, 'emit');
      window.location.href = 'http://www.example.com/full-path?and=query';

      le._onPopState();

      expect(emitStub.calledOnce).to.equal(true);
      expect(emitStub).to.have.been
        .calledWithExactly('urlchange', '/full-path?and=query');
    });

  });


});