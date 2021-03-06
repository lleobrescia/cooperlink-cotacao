/**
 * @property argv         - {@link https://github.com/yargs/yargs}                    - Parsing arguments
 * @property autoprefixer - {@link https://github.com/sindresorhus/gulp-autoprefixer} - Add vendor prefixes to CSS
 * @property concat       - {@link https://github.com/contra/gulp-concat}             - Concatenates js files
 * @property ftp          - {@link https://github.com/morris/vinyl-ftp}               - Blazing fast vinyl adapter for FTP
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
var argv          = require('yargs').argv;
var autoprefixer  = require('gulp-autoprefixer');
var concat        = require('gulp-concat');
var ftp           = require( 'vinyl-ftp' );
var gulp          = require('gulp');
var htmlmin       = require('gulp-htmlmin');
var htmlreplace   = require('gulp-html-replace');
var imagemin      = require('gulp-imagemin');
var minifyCss     = require('gulp-clean-css');
var ngAnnotate    = require('gulp-ng-annotate');
var phpMinify     = require('@aquafadas/gulp-php-minify');
var plumber       = require('gulp-plumber');
var rename        = require('gulp-rename');
var replace       = require('gulp-replace');
var replacePhp    = require('gulp-replace-task');
var shell         = require('gulp-shell');
var stripDebug    = require('gulp-strip-debug');
var templateCache = require('gulp-angular-templatecache');
var uglify        = require('gulp-uglify');
var util          = require('gulp-util');

var names = {
  css:          'style.css',
  cssMin:       'style.min.css',
  deployFolder: 'cotacao',
  js:           'app.js',
  jsMin:        'app.min.js',
  serverFolder: 'desenvolvimento'
};

var paths = {
  deploy:     'https://cooperlink.com.br/'+ names.deployFolder,
  deployBase: '/' + names.deployFolder + '/',
  local:      'http://localhost/multiplicar/cotacao',
  localBase:  '/multiplicar/cotacao/',
  server:     'https://cooperlink.com.br/'+ names.serverFolder,
  serverBase: '/' + names.serverFolder + '/',
  src: {
    css:    ['src/css/**/*.css'],
    html:   ['index.html'],
    img:    ['src/img/*.{JPG,jpg,png,gif}'],
    js:     ['src/app/**/*.js'],
    origin: ['src/'],
    php:    ['src/php/*.php'],
    vendor: ['src/js/**/*.js'],
    views:  ['src/app/**/*.html']
  },
  dist: {
    css:    'dist/css/',
    img:    'dist/img/',
    js:     'dist/js/',
    origin: 'dist/',
    php:    'dist/php/',
    vendor: 'dist/js/vendor'
  }
};

var production = false;

function GetFtpConnection() {
  return ftp.create({
    host:     'ftp.cooperlink.com.br',
    user:     'cooperlink',
    password: 'Sinappe159',
    parallel: 5,
    log:      util.log
  });
}

gulp.task('default', ['html', 'img', 'templates', 'js', 'php', 'vendor', 'css']);

gulp.task('css', function () {
  return gulp.src(paths.src.css)
    .pipe(plumber())
    .pipe(autoprefixer({
      browsers: [
        '> 1%',
        'last 2 versions',
        'firefox >= 4',
        'safari 7',
        'safari 8',
        'IE 8',
        'IE 9',
        'IE 10',
        'IE 11'
      ],
      cascade: false
    }))
    .pipe(gulp.dest(paths.dist.css))
    .pipe(minifyCss())
    .pipe(rename(names.cssMin))
    .pipe(gulp.dest(paths.dist.css))
    .on('error', util.log);
});

/**
 * @task docs
 * @desc Gera a documenta????o do app, baseado no docsjs
 */
gulp.task('docs', shell.task([
  'node node_modules/jsdoc/jsdoc.js ' +
  '-c ./node_modules/angular-jsdoc/common/conf.json ' +
  '-t ./node_modules/angular-jsdoc/angular-template ' +
  '-d ./docs ' +
  './README.md ' +
  '-r ./' + paths.dist.js + names.js
]));

/**
 * @task html
 * @desc Troca o local de src para dist no html
 * 
 */
gulp.task('html', function () {

  var script1 = "<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);      })(window,document,'script','dataLayer','GTM-TRZPL33');</script>";
  var script2 = '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TRZPL33"  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>';

  return gulp.src(paths.src.html)
    .pipe(plumber())
    .pipe(htmlreplace({
      'app': production || argv.production ? 'js/' + names.jsMin : 'js/' + names.js,
      'templates': 'js/app.templates.js',
      'base': {
        src: production || argv.production ? paths.deployBase : paths.serverBase,
        tpl: '<base href="%s">'
      },
      'css': 'css/' + names.cssMin,
      'favicon': {
        src: 'img/favicon-cooperlink.png',
        tpl: '<link type="image/png" href="%s" rel="icon">'
      },
      'manager': {
        src: '',
        tpl: production || argv.production ? script1 : ""
      },
      'managerbody': {
        src: '',
        tpl: production || argv.production ? script2 : ""
      },
      'pagseguro': production || argv.production ? 'https://stc.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js' : 'https://stc.sandbox.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js',
      'vendor': 'js/vendor/vendor.min.js'
    }))
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(paths.dist.origin))
    .on('error', util.log);
});

/**
 * @task img
 * @desc Minify imagem
 */
gulp.task('img', function () {   
  return gulp.src(paths.src.img)
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest(paths.dist.img))
    .on('error', util.log);
});

/**
 * @task js
 * @desc Concatena os arquivos js dentro de app
 * 'criptografa', minify e envia para a pasta js
 */
gulp.task('js', function () {
  return gulp.src(paths.src.js)
    .pipe(plumber())
    .pipe(concat(names.js))
    .pipe(gulp.dest('./'))
    .pipe(replace(paths.local, production || argv.production ? paths.deploy : paths.server))
    .pipe(replace('dist/', ''))
    .pipe(replace('src/', ''))
    .pipe(gulp.dest(paths.dist.js))
    .pipe(stripDebug())
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(rename(names.jsMin))
    .pipe(gulp.dest(paths.dist.js))
    .on('error', util.log);
});

/**
 * @task php
 * @desc Concatena os html
 */
gulp.task('php', function () {
  return gulp.src(paths.src.php)
    .pipe(plumber())
    .pipe(phpMinify())
    .pipe(replacePhp({
      patterns: [{
        match:       /localhost/g,
        replacement: 'cooperlink.com.br'
      },
      {
        match:       /testeCooperlink/g,
        replacement: production || argv.production ? 'producaoCooperlink' : 'testeCooperlink'
      }]
    }))
    .pipe(gulp.dest(paths.dist.php))
    .on('error', util.log);
});

/**
 * @task vendor
 * @desc Concatena os scripts vendor
 */
gulp.task('vendor', function () {
  return gulp.src(paths.src.vendor)
    .pipe(plumber())
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(paths.dist.vendor))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(rename('vendor.min.js'))
    .pipe(gulp.dest(paths.dist.vendor))
    .on('error', util.log);
});

gulp.task('templates', function () {
  return gulp.src(paths.src.views)
    .pipe(plumber())
    .pipe(templateCache('app.templates.js',{standalone:true }))
    .pipe(gulp.dest(paths.dist.js))
    .on('error', util.log);
});

/**
 * @task watch
 * @desc 'Vigia' todos os arquivos. Havendo modifica????o executa sua respectiva task
 */
gulp.task('watch', function () {
  var conn = GetFtpConnection();

  production = argv.production;

  gulp.watch(paths.src.css,     ['css']);
  gulp.watch(paths.src.js,      ['js']);
  gulp.watch(paths.src.html,    ['html']);
  gulp.watch(paths.src.views,   ['templates']);
  gulp.watch(paths.src.vendor,  ['vendor']);
  gulp.watch(paths.src.img,     ['img']);
  gulp.watch(paths.src.php,     ['php']);

  gulp.watch(paths.dist.origin + '**/*').on('change', function (event) {
    console.log('Uploading file "' + event.path + '", ' + event.type);

    gulp.src([event.path], { base: './dist/', buffer: false })
      .pipe(conn.newer(argv.production ? '/' + names.deployFolder   : '/' + names.serverFolder)) // only upload newer files 
      .pipe(conn.dest(argv.production ? '/www/' + names.deployFolder : '/www/' + names.serverFolder));

  });
});