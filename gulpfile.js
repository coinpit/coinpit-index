'use strict'

var gulp    = require('gulp')
var gutil   = require('gulp-util')
var exit    = require('gulp-exit')
var mocha   = require('gulp-mocha')
var jshint  = require('gulp-jshint');
var del     = require('del');
var gulpNSP = require('gulp-nsp');

var paths = {
  src   : './src/**/*',
  specs : ['./specs/**/*.js'],
  config: './config/**/*',
  dist  : "./dist/",
  artifact: process.env.CIRCLE_ARTIFACTS || "artifacts",
}

gulp.task('build', ['clean'], function (cb) {
  return gulp.src([paths.src, paths.config, 'package.json'], {base:'.'})
    .pipe(gulp.dest(paths.dist))
})

gulp.task('clean', function () {
  return del([paths.dist])
})

gulp.task('nsp', function (cb) {
  gulpNSP({ package: __dirname + '/package.json', stopOnError: false }, cb);
});


gulp.task('test', ['lint', 'nsp'], function () {
  return gulp.src(paths.specs, { read: false })
    .pipe(mocha({ reporter: 'spec' }))
    .pipe(exit())
})

gulp.task('lint', function () {
  return gulp.src([paths.src])
    .pipe(jshint())
    .pipe(jshint.reporter('gulp-jshint-html-reporter',
                          {
                            filename            : paths.artifact + "/jshint" + "/jshint.html",
                            createMissingFolders: true
                          }
    ))
});

