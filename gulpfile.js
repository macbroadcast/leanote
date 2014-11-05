
var gulp = require('gulp');
var changed = require('gulp-changed');
var less = require('gulp-less');
var coffee = require('gulp-coffee');
var prefix = require('gulp-autoprefixer');
var minify = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

var exec = require('child_process').exec;
var path = require('path');
var util = require('util');

var paths = {
    dest: 'public/dist/',
    less: 'public/src/less/*.less',
    coffee: 'public/src/coffee/*.coffee',
    css: 'public/src/css/',
    js: 'public/src/js/'
};
var combos = {
};

function notify(err) {
    var title = err.plugin + ' ' + err.name;
    var msg = err.message;
    // strip terminal color
    // msg = msg.replace(/\x1b\[(\d{1,2}(;\d{1,2})?)?[mK]/g, '');
    msg = msg.replace(path.resolve('.') + '/', ''); // show relative path in error msg
    msg = msg.replace(/['"$\\`]/g, '\\$&'); // escape shell characters
    var cmd;
    if(require('os').type() == 'Linux') {
        cmd = util.format('notify-send -t 20000 -u critical "%s" "%s"', title, msg);
    } else {
        cmd = util.format('osascript -e \'display notification "%s" with title "%s" sound name "Morse"\'', msg, title);
    }
    console.log(err.toString());
    exec(cmd, function(e) {
        e && console.log(e.toString());
    });
}


gulp.task('css', ['less'], function() {
    gulp.src(['public/src/**/*.css', '!**/*.min.css', '!public/src/css/*.css'])
        .pipe(changed(paths.dest))
        .pipe(minify())
        .pipe(gulp.dest(paths.dest));
});

gulp.task('scripts', ['coffee'], function() {
    gulp.src(['public/src/**/*.js', '!**/*.min.js'])
        .pipe(changed(paths.dest))
        .pipe(uglify())
        .pipe(gulp.dest(paths.dest));
});

gulp.task('copy', function() {
    gulp.src('public/src/**/*.{min.js,min.css,png,jpg,gif,swf,htc,eot,svg,ttf,woff}')
        .pipe(gulp.dest(paths.dest));
});

gulp.task('less', function() {
    var dest = paths.dest + 'css/';
    gulp.src([paths.less, '!public/src/less/mixins.less'])
        .pipe(changed(dest, {extension: '.css'}))
        .pipe(less().on('error', notify))
        .pipe(prefix("last 1 version", "> 1%", "ie 8"))
        .pipe(gulp.dest(paths.css))
        .pipe(minify())
        .pipe(gulp.dest(dest));
});

gulp.task('coffee', function() {
    gulp.src(paths.coffee)
        .pipe(changed(paths.js, {extension: '.js'}))
        .pipe(coffee({bare: true}).on('error', notify))
        .pipe(gulp.dest(paths.js));
});

gulp.task('concat', function() {
    var fs = require('fs')
    for(var d in combos) {
        combos[d].forEach(function(f) {
            if(!fs.existsSync(paths.dest + f)) {
                throw new Error('File not found "' + paths.dest + f + '"');
            }
        });
        console.log('Concat [ %s ] --> %s', combos[d].join(', '), d);
        gulp.src(combos[d], { cwd: paths.dest })
            .pipe(concat(path.basename(d)))
            .pipe(gulp.dest(paths.dest + path.dirname(d)));
    }
});

gulp.task('watch', ['less', 'coffee'], function() {
    console.log('Watching to compile less and coffee files...');
    gulp.watch(paths.less, ['less']);
    gulp.watch('public/src/coffee/*.coffee', ['coffee']);
});

gulp.task('default', ['watch']);

gulp.task('dist', ['copy', 'css', 'scripts', 'concat']);
