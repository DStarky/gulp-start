const { src, dest, watch, parallel, series } = require("gulp");

const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const browserSync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const clean = require("gulp-clean");
const avif = require("gulp-avif");
const webp = require("gulp-webp");
const fonter = require("gulp-fonter");
const ttf2woff2 = require("gulp-ttf2woff2");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const include = require("gulp-include");
const svgSprite = require("gulp-svg-sprite");


function pages(){
  return src('src/pages/*.html')
  .pipe(include({
    includePaths: 'src/components'
  }))
  .pipe(dest('src'))
  .pipe(browserSync.stream())
}

function fonts(){
  return src('src/fonts/src/*.*')
    .pipe(fonter({
      formats: ['woff', 'ttf']
    }))
    .pipe(src('src/fonts/*.ttf'))
    .pipe(ttf2woff2())
    .pipe(dest('src/fonts/'))
}

function images(){
  return src(['src/images/src/*.*', '!src/images/src/*.svg'])
  .pipe(newer('src/images'))
  .pipe(avif( { quality : 50 }))

  .pipe(src('src/images/src/*.*'))
  .pipe(newer('src/images'))
  .pipe(webp())

  .pipe(src('src/images/src/*.*'))
  .pipe(newer('src/images'))
  .pipe(imagemin())

  .pipe(dest('src/images'))
}

function scripts() {
  return src("src/scripts/main.js")
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("src/scripts"))
    .pipe(browserSync.stream());
}

function styles() {
  return src("src/scss/style.scss")
    .pipe(autoprefixer({ overrideBrowserslist: ["last 6 version"] }))
    .pipe(concat("style.min.css"))
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(dest("src/css"))
    .pipe(browserSync.stream());
}

function watching() {
  browserSync.init({
    server: {
      baseDir: "src/",
    },
  });
  watch(["src/scss/style.scss"], styles);
  watch(["src/images/src"], images);
  watch(["src/scripts/main.js"], scripts);
  watch(["src/components/*", 'src/pages/*'], pages);
  watch(["src/*.html"]).on("change", browserSync.reload);
}


function cleanDist(){
  return src('dist').pipe(clean())
}

function building() {
  return src(
    ["src/css/style.min.css", "src/scripts/main.min.js", "src/*.html", 'src/images/dist/*.*', 'src/fonts/*.*'],
    { base: "src" }
  ).pipe(dest("./dist"));
}

exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.images = images;
exports.fonts = fonts;
exports.pages = pages;
exports.clean = cleanDist;



// GENERAL TASKS

exports.build = series(cleanDist, building);
exports.default = parallel(styles, images, scripts, pages, watching);
