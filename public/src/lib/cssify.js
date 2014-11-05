var fs = require('fs');
var path = require('path');
function require_plugin(name) {
    return require(path.join(path.resolve('../node_modules'), name));
}
var less = require_plugin('gulp-less/node_modules/less');
var autoprefixer = require_plugin('gulp-autoprefixer/node_modules/autoprefixer');
var CleanCSS = require_plugin('gulp-minify-css/node_modules/clean-css');

var sourcename = process.argv[2];
var compress = process.argv[3];
var lessOpts = { paths: ['src/less'] };
var prefixerOpts = ["last 1 version", "> 1%", "ie 8" ];

var contents = fs.readFileSync(sourcename).toString('utf8').trim();
less.render(contents, lessOpts, function(err, css) {
    if (err) {
        console.error(err);
        process.exit(10);
    }
    var prefixed = autoprefixer(prefixerOpts).process(css).css;

    var compressed =  compress ? new CleanCSS().minify(prefixed) : prefixed;
    
    console.log(compressed);
});
