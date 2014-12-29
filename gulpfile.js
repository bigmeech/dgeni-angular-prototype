var gulp = require('gulp');
var Dgeni = require('dgeni');

gulp.task('dgeni', function() {
    try {
        return new Dgeni([require('./docs/dgeni-config.js')]).generate();
    } catch(x) {
        console.log(x.stack);
        throw x;
    }
});

gulp.task('default', ['dgeni']);