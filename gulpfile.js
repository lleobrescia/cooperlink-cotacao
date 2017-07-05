/**
 * 
 * @property concat       - {@link https://github.com/contra/gulp-concat}             - Concatenates js files
 * @property gulp         - {@link http://gulpjs.com/}                                - Tasks runner
 * @property imagemin     - {@link https://github.com/sindresorhus/gulp-imagemin}     - Minify PNG, JPEG, GIF and SVG images
 * @property ngAnnotate   - {@link https://github.com/Kagami/gulp-ng-annotate}        - Add angularjs dependency injection annotations
 * @property plumber      - {@link https://github.com/floatdrop/gulp-plumber}         - Prevent pipe breaking caused by errors from gulp plugins
 * @property rename       - {@link https://github.com/hparra/gulp-rename}             - Provides simple file renaming methods.
 * @property shell        - {@link https://github.com/sun-zheng-an/gulp-shell}        - A handy command line interface for gulp
 * @property uglify       - {@link https://github.com/terinjokes/gulp-uglify}         - Minify JavaScript with UglifyJS3.
 * @property util         - {@link https://github.com/gulpjs/gulp-util}               - Utility functions for gulp plugins
 */
var concat       = require('gulp-concat');
var gulp         = require('gulp');
var imagemin     = require('gulp-imagemin');
var ngAnnotate   = require('gulp-ng-annotate');
var plumber      = require('gulp-plumber');
var rename       = require('gulp-rename');
var shell        = require('gulp-shell');
var uglify       = require('gulp-uglify');
var util         = require('gulp-util');

/**
 * @task js
 * @desc Concatena os arquivos js dentro de app
 * 'criptografa', minify e envia para a pasta js
 */
gulp.task('js', function () {
  return gulp.src('producao/**/*.js', {
      base: './'
    })
    .pipe(plumber())
    .pipe(concat('app.js'))
    .pipe(gulp.dest('js/'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('js/'))
    .on('error', util.log);
});

/**
 * @task image
 * @desc Minify imagem
 */
gulp.task('image', function () {
  return gulp.src('img/*', {
      base: './'
    })
    .pipe(plumber())
    .pipe(imagemin())
    .on('error', util.log);
});


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
  '-r ./js/dashboard.js'
]));

/**
 * @task watch
 * @desc 'Vigia' todos os arquivos. Havendo modificação executa sua respectiva task
 */
gulp.task('watch', function () {
  gulp.watch(['producao/**/*.js'], ['js']);
  gulp.watch(['img/*'], ['image']);
});