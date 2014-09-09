var gulp = require('gulp')
  , jscs = require('gulp-jscs')
  , mocha = require('gulp-mocha');

gulp.task('mocha', function () {
  return gulp.src('./test/*.js', { read: false })
    .pipe(mocha({ reporter: 'list' }));
})

gulp.task('default', ['mocha'], function () {
  return gulp.src(['index.js', './lib/**/*.js', './dispatcher/**/*.js'])
    .pipe(jscs());
});