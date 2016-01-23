var gulp = require('gulp');
var jshint = require('gulp-jshint');

gulp.task('lint', function() {
  var src = [
    './examples/**/*.js',
    './lib/**/*.js',
    './promise/**/*.js'
  ];
  return gulp.src(src)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});
