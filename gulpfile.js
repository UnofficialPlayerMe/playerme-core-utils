var gulp     = require('gulp');
var path     = require('path');
var webpack  = require('webpack-stream');

//////////////////////////////////////

gulp.task('default', ['lint', 'test', 'build', 'doc']);

gulp.task('build', function() {
    return gulp.src(
        'src/entry.js'
    ).pipe(
        webpack({
            output: {
                filename: 'playerme-core-utils.js',
                library: ['PlayerMe', 'utils']
            }
        })
    )
    .pipe(
        gulp.dest('dist/')
    );
});

gulp.task('doc', function (done) {
    // TODO doc
});

gulp.task('test', function (done) {
    // TODO test
});
gulp.task('tdd', function (done) {
    // TODO tdd
});

gulp.task('lint', function () {
    // TODO lint
});
