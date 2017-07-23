/**
 * 
 * @property autoprefixer - {@link https://github.com/sindresorhus/gulp-autoprefixer} - Add vendor prefixes to CSS
 * @property concat       - {@link https://github.com/contra/gulp-concat}             - Concatenates js files
 * @property gulp         - {@link http://gulpjs.com/}                                - Tasks runner
 * @property htmlmin      - {@link https://github.com/jonschlinkert/gulp-htmlmin}     - Gulp plugin to minify HTML.
 * @property htmlreplace  - {@link https://github.com/VFK/gulp-html-replace}          - Replace build blocks in HTML. Like useref but done right.
 * @property imagemin     - {@link https://github.com/sindresorhus/gulp-imagemin}     - Minify PNG, JPEG, GIF and SVG images
 * @property ngAnnotate   - {@link https://github.com/Kagami/gulp-ng-annotate}        - Add angularjs dependency injection annotations
 * @property phpMinify    - {@link https://github.com/aquafadas-com/gulp-php-minify}  - Gulp.js plug-in minifying PHP source code by removing comments and whitespace.
 * @property plumber      - {@link https://github.com/floatdrop/gulp-plumber}         - Prevent pipe breaking caused by errors from gulp plugins
 * @property rename       - {@link https://github.com/hparra/gulp-rename}             - Provides simple file renaming methods.
 * @property replace       -{@link https://github.com/lazd/gulp-replace}              - A string replace plugin for gulp.
 * @property shell        - {@link https://github.com/sun-zheng-an/gulp-shell}        - A handy command line interface for gulp
 * @property uglify       - {@link https://github.com/terinjokes/gulp-uglify}         - Minify JavaScript with UglifyJS3.
 * @property util         - {@link https://github.com/gulpjs/gulp-util}               - Utility functions for gulp plugins
 */
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var htmlreplace = require('gulp-html-replace');
var imagemin = require('gulp-imagemin');
var minifyCss = require('gulp-clean-css');
var ngAnnotate = require('gulp-ng-annotate');
var phpMinify = require('@aquafadas/gulp-php-minify');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var replacePhp = require('gulp-replace-task');
var shell = require('gulp-shell');
var uglify = require('gulp-uglify');
var util = require('gulp-util');

var names = {
  js: 'app.js',
  jsMin: 'app.min.js',
  css: 'style.css',
  cssMin: 'style.min.css'
};
var paths = {
  local: 'localhost/multiplicar/cotacao',
  localBase: '/multiplicar/cotacao/',
  server: 'multiplicarbrasil.com.br/sistemanovo',
  serverBase: '/sistemanovo/',
  dev: {
    css: ['dev/css/**/*.css'],
    html: ['index.html'],
    img: ['dev/img/*.{JPG,jpg,png,gif}'],
    js: ['dev/app/**/*.js'],
    origin: ['dev/'],
    php: ['dev/php/*.php'],
    vendor: ['dev/js/**/*.js'],
    views: ['dev/views/**/*.html']
  },
  dis: {
    css: 'dis/css/',
    img: 'dis/img/',
    js: 'dis/js/',
    origin: 'dis/',
    php: 'dis/php/',
    vendor: 'dis/js/vendor',
    views: 'dis/views/'
  }
};

gulp.task('default', ['watch']);

/**
 * @task docs
 * @desc Gera a documentação do app, baseado no docsjs
 */
gulp.task('docs', shell.task([
  'node node_modules/jsdoc/jsdoc.js ' +
  '-c ./node_modules/angular-jsdoc/common/conf.json ' +
  '-t ./node_modules/angular-jsdoc/angular-template ' +
  '-d ./docs ' +
  './README.md ' +
  '-r ./' + paths.dis.js + names.js
]));

/**
 * @task html
 * @desc Troca o local de dev para dis no html
 */
gulp.task('html', function () {
  return gulp.src(paths.dev.html)
    .pipe(plumber())
    .pipe(htmlreplace({
      'app': 'js/' + names.cssMin,
      'base': {
        src: paths.serverBase,
        tpl: '<base href="%s">'
      },
      'css': 'css/' + names.cssMin,
      'favicon': {
        src: 'img/favicon-multiplicar.png',
        tpl: '<link type="image/png" href="%s" rel="icon">'
      },
      'vendor': 'js/vendor/vendor.min.js'
    }))
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(paths.dis.origin))
    .on('error', util.log);
});

/**
 * @task img
 * @desc Minify imagem
 */
gulp.task('img', function () {
  return gulp.src(paths.dev.img)
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest(paths.dis.img))
    .on('error', util.log);
});

/**
 * @task js
 * @desc Concatena os arquivos js dentro de app
 * 'criptografa', minify e envia para a pasta js
 */
gulp.task('js', function () {
  return gulp.src(paths.dev.js)
    .pipe(plumber())
    .pipe(concat(names.js))
    .pipe(replace(paths.local, paths.server))
    .pipe(replace('dis/', ''))
    .pipe(gulp.dest(paths.dis.js))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(rename(names.jsMin))
    .pipe(gulp.dest(paths.dis.js))
    .on('error', util.log);
});

/**
 * @task php
 * @desc Concatena os html
 */
gulp.task('php', function () {
  return gulp.src(paths.dev.php)
    .pipe(plumber())

    .pipe(phpMinify())
    .pipe(replacePhp({
      patterns: [{
        match: /localhost/g,
        replacement: 'multiplicarbrasil.com.br'
      }]
    }))
    .pipe(gulp.dest(paths.dis.php))
    .on('error', util.log);
});

/**
 * @task vendor
 * @desc Concatena os scripts vendor
 */
gulp.task('vendor', function () {
  return gulp.src(paths.dev.vendor)
    .pipe(plumber())
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(paths.dis.vendor))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(rename('vendor.min.js'))
    .pipe(gulp.dest(paths.dis.vendor))
    .on('error', util.log);
});

/**
 * @task views
 * @desc Concatena os html
 */
gulp.task('views', function () {
  return gulp.src(paths.dev.views)
    .pipe(plumber())
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(paths.dis.views))
    .on('error', util.log);
});

/**
 * @task watch
 * @desc 'Vigia' todos os arquivos. Havendo modificação executa sua respectiva task
 */
gulp.task('watch', ['html', 'img', 'js', 'php', 'vendor', 'views'], function () {
  gulp.watch(paths.dev.css, ['css']);
  gulp.watch(paths.dev.js, ['js']);
  gulp.watch(paths.dev.html, ['html']);
  gulp.watch(paths.dev.views, ['views']);
  gulp.watch(paths.dev.vendor, ['vendor']);
  gulp.watch(paths.dev.img, ['img']);
  gulp.watch(paths.dev.php, ['php']);
});