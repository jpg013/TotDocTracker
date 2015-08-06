// Dependencies
// -------------------------
require("./server/environment")
var gulp        = require('gulp');
var rename      = require('gulp-rename');
var less        = require('gulp-less')
var minifyCSS   = require('gulp-minify-css');
var nodemon     = require('gulp-nodemon');
var browserify  = require('browserify');
var rename      = require('gulp-rename');
var del         = require('del');
var gulpuglify  = require('gulp-uglify');
var source      = require('vinyl-source-stream');
var runSequence = require('run-sequence');
var gulpif      = require('gulp-if');
var prefix      = require('gulp-autoprefixer');
var concat      = require('gulp-concat');

// Tasks
// -------------------------

// Only uglify if not in development
var uglify = function() {
  return gulpif(process.env.NODE_ENV !== 'development', gulpuglify());
};

// Build tasks
gulp.task('browserify', function() {
  var b = browserify('./client/js/app.js', {debug: true})
  return b.bundle()
    .pipe(source('app.browserified.js'))
    .pipe(gulp.dest('./build'))
});

gulp.task('js', function() {
    return gulp.src(['./client/main.js', './client/**/*.js'])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./build'))
});

gulp.task('minify', ['styles'], function() {
  return gulp.src('./build/bundle.css')
    .pipe(minifyCSS())
    .pipe(rename('app.min.css'))
    .pipe(gulp.dest('./public/css'))
});

gulp.task('uglify', function() {
  return gulp.src('build/app.js')
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('public/js'));
});

// Style tasks
gulp.task('styles', function() {
  return gulp.src('./client/less/index.less')
    .pipe(less())
    .pipe(prefix({ cascade: true }))
    .pipe(rename('bundle.css'))
    .pipe(gulp.dest('./build'))
});

// Clean tasks
gulp.task('clean', ['cleanbuild'], function(done) {
  del(['./public/js', './public/css'], done)
});

gulp.task('cleanbuild', function(done) {
  del(['./build'], done)
});

// commands
gulp.task('build', ['clean'], function(done) {
  return runSequence('js', 'uglify', 'cleanbuild', done);
});

gulp.task('watch', function(done) {
  gulp.watch('client/*.js', ['build']);
  gulp.watch('client/**/*.js', ['build']);
  return runSequence('build', done);
});

gulp.task('dev', ['watch'], function() {
  nodemon({
    script: 'server/server.js',
    delay: 2500
  })
});
