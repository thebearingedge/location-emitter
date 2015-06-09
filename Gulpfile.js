'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');

var tests = ['test/*.test.js'];

var coverageConfig = {
  dir: './coverage',
  reporters: ['html']
};

gulp.task('cover', function (cb) {
  gulp.src('lokation.js')
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', function () {
      gulp.src(tests, { read: false })
        .pipe(mocha({ reporter: 'min' }))
        .pipe(istanbul.writeReports(coverageConfig))
        .on('end', cb);
    });
});

gulp.task('tdd', function () {
  gulp.watch(tests.concat('lokation.js'), ['cover']);
});