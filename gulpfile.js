// Gulp Dependencies
var gulp = require('gulp');
var rename = require('gulp-rename');

// Build Dependencies
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var reactify = require('reactify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var minifyCSS = require('gulp-minify-css');
var gulpCopy = require('gulp-copy');
var environments = require('gulp-environments');
var development = environments.development;
var production = environments.production;
// Development Dependencies
var eslint = require('gulp-eslint');

//AWS
var awspublish = require('gulp-awspublish')
  , cloudfront = require('gulp-cloudfront-invalidate-aws-publish');

var publisher = awspublish.create({
      region: 'us-east-1',
      params: {
        Bucket: 'cl-tracking'
      }
});
var cfSettings = {
  distribution: 'EC9U4WEMEZ1DP', // Cloudfront distribution ID
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,             // Optional AWS Access Key ID
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,         // Optional AWS Secret Access Key
  wait: false,                     // Whether to wait until invalidation is completed (default: false)
  indexRootPaths: true            // Invalidate index.html root paths (`foo/index.html` and `foo/`) (default: false)
}
var headers = {
    'Cache-Control': 'max-age=60, no-transform, public'
};
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
    var env = production() ? "./prod" : "./dev";
    var b = browserify({
      entries: './chrome/extension/inject.js',
      debug: true,
      // defining transforms here will avoid crashing your stream
      // transform: [reactify]
    }).transform(babelify.configure({
            presets: ["es2015", "stage-0", "react"],
            plugins: ["add-module-exports", "transform-decorators-legacy", "transform-runtime"]
    }));
    return b.bundle()
    .pipe(source('index.js'))
    .pipe(rename('inject.js'))
    .pipe(gulp.dest('build'))
    .pipe(gulp.dest(env + '/js'))
    .pipe(gulp.dest('public/javascripts'));
});

gulp.task('browserify-background',  function() {
    var b = browserify({
      entries: './chrome/extension/background.js',
      debug: true,
      // defining transforms here will avoid crashing your stream
      // transform: [reactify]
    }).transform(babelify.configure({
            presets: ["es2015", "stage-0", "react"],
            plugins: ["add-module-exports", "transform-decorators-legacy", "transform-runtime"]
    }));

    return b.bundle()
    .pipe(source('index.js'))
    .pipe(rename('background.js'))
    .pipe(gulp.dest('build'))
    .pipe(gulp.dest('public/javascripts'));
});

gulp.task('browserify-todo',  function() {
    var b = browserify({
      entries: './chrome/extension/todoapp.js',
      debug: true,
    }).transform(require('browserify-postcss'),{
      inject: true
    }).transform(babelify.configure({
            presets: ["es2015", "stage-0", "react"],
            plugins: ["add-module-exports", "transform-decorators-legacy", "transform-runtime"]
    }));

    return b.bundle()
    .pipe(source('index.js'))
    .pipe(rename('todoapp.js'))
    .pipe(gulp.dest('build'))
    .pipe(gulp.dest('public/javascripts'));
});

gulp.task('browserify', ['browserify-background','browserify-inject','browserify-popup'], function() {
    var b = browserify({
      entries: './chrome/extension/prospector.js',
      debug: true,
    }).transform(babelify.configure({
            presets: ["es2015", "stage-0", "react"],
            plugins: ["add-module-exports", "transform-decorators-legacy", "transform-runtime"]
    }));

    return b.bundle()
    .pipe(source('index.js'))
    .pipe(rename('prospector.js'))
    .pipe(gulp.dest('build'))
    .pipe(gulp.dest('public/javascripts'));
});

gulp.task('copy-static',  function() {
  var env = production() ? "./prod" : "./dev";

  return gulp.src([ 'chrome/assets/**', 'chrome/views/*' ])
        .pipe(gulp.dest(env));
});

gulp.task('copy-manifest',  function() {
  var manifest = production() ? "manifest.prod.json" : "manifest.dev.json";
  var env = production() ? "./prod" : "./dev";

  return gulp.src('chrome/' + manifest)
        .pipe(rename('manifest.json'))
        .pipe(gulp.dest(env));
});

gulp.task('bundle',  ['browserify','copy-static','copy-manifest']);

gulp.task('uglify-background', function() {
  return gulp.src('build/background.js')
    // .pipe(stripDebug())
    .pipe(uglify())
    .pipe(rename('background.min.js'))
    .pipe(gulp.dest('public/javascripts'));
});
gulp.task('uglify-prospector', function() {
  return gulp.src('build/prospector.js')
    // .pipe(stripDebug())
    .pipe(uglify())
    .pipe(rename('prospector.min.js'))
    .pipe(gulp.dest('public/javascripts'));
});
gulp.task('uglify-popup', function() {
  return gulp.src('build/popup.js')
    // .pipe(stripDebug())
    .pipe(uglify())
    .pipe(rename('popup.min.js'))
    .pipe(gulp.dest('public/javascripts'));
});
gulp.task('uglify',['uglify-background','uglify-prospector','uglify-popup']);
gulp.task('publish', ['uglify'], function() {
  return gulp.src(['public/javascripts/background.min.js','public/javascripts/prospector.min.js','public/javascripts/popup.min.js'])
    .pipe(stripDebug())
    .pipe(publisher.publish(headers))
    .pipe(cloudfront(cfSettings))
    .pipe(publisher.cache())
    .pipe(awspublish.reporter());
});
