import gulp from "gulp";
import babel from "gulp-babel";
import cleanCSS from "gulp-clean-css";
import rename from "gulp-rename";
import del from "del";
import uglify from "gulp-uglify";
import browserify from "browserify";
import tap from "gulp-tap";
import buffer from "gulp-buffer";
import eslint from "gulp-eslint";
import prettierEslint from "gulp-prettier-eslint";

gulp.task("clean:dist", () => del("app/static/dist/"));

gulp.task("prettier:js", () =>
    gulp
    .src("app/static/assets/js/*.js")
    .pipe(prettierEslint())
    .pipe(gulp.dest("app/static/assets/js"))
    .pipe(eslint())
    .pipe(eslint.format())
);

gulp.task("eslint:js", () =>
    gulp
    .src("app/static/assets/js/*.js")
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
);

// transpile JS into ES5 for backwards compatibility
gulp.task("transpile:scripts", () =>
    gulp
    .src("app/static/assets/js/*.js")
    .pipe(babel())
    .pipe(
        rename({
            suffix: ".min"
        })
    )
    .pipe(gulp.dest("app/static/dist/js"))
);

gulp.task("browserify:scripts", () =>
    gulp
    .src("app/static/dist/js/*.min.js", {
        read: false
    })

    .pipe(
        tap(function (file) {
            file.contents = browserify(file.path).bundle();
        })
    )

    .pipe(buffer())
    .pipe(gulp.dest("app/static/dist/js"))
);

// minify JS files
gulp.task("minify:scripts", () =>
    gulp
    .src("app/static/dist/js/*.min.js")
    .pipe(uglify())
    .pipe(gulp.dest("app/static/dist/js"))
);

// minify CSS files
gulp.task("minify:styles", () =>
    gulp
    .src("app/static/assets/css/*.css")
    .pipe(cleanCSS())
    .pipe(
        rename({
            suffix: ".min"
        })
    )
    .pipe(gulp.dest("app/static/dist/css/"))

);

gulp.task(
    "compile",
    gulp.series(
        // "eslint:js",
        "clean:dist",
        "transpile:scripts",
        "browserify:scripts",
        gulp.parallel("minify:styles")
    )
);

gulp.task("default", gulp.series("compile"));