
'use strict';

var jsdom = require('mocha-jsdom');
var expect = require('chai').expect;
var Lokation = require('../lokation');
var lokation;

describe('Lokation', function () {

  jsdom();

  describe('EventEmitter.prototype', function () {

    it('should have EventEmitter instance methods', function () {
      lokation = new Lokation();
      expect(typeof lokation.emit).to.equal('function');
    });

  });


  describe('#url()', function () {

    it('should retrieve the current url after hash', function () {
      window.location.href = 'www.example.com';
      window.location.hash = '/hash';
      lokation = new Lokation();

      var hash = lokation.hash();
      expect(hash).to.equal('/hash');
    });

  });

  describe('#_initialize(options)', function () {

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
      it('should fallback from window.history', function () {
        var pushState = window.history.pushState;
        window.history.pushState = undefined;

        lokation = new Lokation({ html5: true });
        expect(lokation.html5).to.equal(false);

        window.history.pushState = pushState;
      });
    });

  });

});