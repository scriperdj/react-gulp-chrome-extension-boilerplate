// Gulp Dependencies
var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var minifyCSS = require('gulp-minify-css');
var gulpCopy = require('gulp-copy');
var environments = require('gulp-environments');
var eslint = require('gulp-eslint');
var pug = require('gulp-pug');

// Build Dependencies
var browserify = require('browserify');
var reactify = require('reactify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var cssmodulesify = require('css-modulesify');

var development = environments.development;
var production = environments.production;
var env = production() ? "./prod" : "./dev";
var postCSSPlugins = [
  'postcss-modules-local-by-default',
  'postcss-modules-extract-imports',
  'postcss-modules-scope',
  'postcss-autoreset',
  'postcss-initial'
];

gulp.task('lint-react', function() {
  return gulp.src('./app/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('lint-chrome', function() {
  // Ignore inject script because of await keyword
  return gulp.src(['./chrome/**/*.js', '!./chrome/extension/background/inject.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('browserify-inject', ['lint-react','lint-chrome'], function() {
    var b = browserify({
      entries: './chrome/extension/inject.js',
      debug: true,
    }).transform(babelify.configure({
            presets: ["es2015", "stage-0", "react"],
            plugins: ["add-module-exports", "transform-decorators-legacy", "transform-runtime"]
    }));
    return b.bundle()
    .pipe(source('index.js'))
    .pipe(rename('inject.bundle.js'))
    .pipe(gulp.dest(env + '/js'));
});

gulp.task('browserify-background',  function() {
    var b = browserify({
      entries: './chrome/extension/background.js',
      debug: true,
    }).transform(babelify.configure({
            presets: ["es2015", "stage-0", "react"],
            plugins: ["add-module-exports", "transform-decorators-legacy", "transform-runtime"]
    }));

    return b.bundle()
    .pipe(source('index.js'))
    .pipe(rename('background.bundle.js'))
    .pipe(gulp.dest(env + '/js'));
});

gulp.task('browserify',['browserify-background','browserify-inject'], function() {

    var b = browserify({
      entries: './chrome/extension/todoapp.js',
      debug: true,
    }).plugin('css-modulesify', {
        o: env + '/todoapp.css'
      }).transform(babelify.configure({
            presets: ["es2015", "stage-0", "react"],
            plugins: ["add-module-exports", "transform-decorators-legacy", "transform-runtime"]
    }));

    return b.bundle()
    .pipe(source('index.js'))
    .pipe(rename('todoapp.bundle.js'))
    .pipe(gulp.dest(env + '/js'));
});

gulp.task('views',  function() {
  return gulp.src('./chrome/views/*.pug')
  .pipe(pug())
  .pipe(gulp.dest(env));
});

gulp.task('copy-assets',  function() {
  return gulp.src([ 'chrome/assets/**'])
        .pipe(gulp.dest(env));
});

gulp.task('copy-manifest',  function() {
  var manifest = production() ? "manifest.prod.json" : "manifest.dev.json";
  return gulp.src('chrome/' + manifest)
        .pipe(rename('manifest.json'))
        .pipe(gulp.dest(env));
});

gulp.task('default',  ['browserify','views','copy-assets','copy-manifest']);
