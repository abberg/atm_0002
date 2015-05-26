var gulp = require('gulp'),
	connect = require('gulp-connect'),
	git = require('gulp-git'),
    bump = require('gulp-bump'),
    filter = require('gulp-filter'),
    tag_version = require('gulp-tag-version'),
    run_sequence = require('run-sequence'),
    html_replace = require('gulp-html-replace'),
    currentFolder;
 
gulp.task('connect', function() {
  connect.server({
    root: './',
    port: 8888,
    livereload: true
  });
});
 
gulp.task('reload', function () {
  gulp.src('./src/**/*.*')
    .pipe(connect.reload());
});
 
gulp.task('watch', function () {
  gulp.watch(['./src/**/*.*'], ['reload']);
});

gulp.task('replace', function(){
    return gulp.src('./dist/' + currentFolder + '/index.html')
    .pipe(html_replace({
        'css': '',
        'js': ''
    }))
    .pipe(gulp.dest('./dist/' + currentFolder + '/'))
    .pipe(git.add())
    .pipe(git.commit('remove controlbar from index'));
});

gulp.task('copy', function(){

    currentFolder = dateFolderName();

	return gulp.src([
        './src/**/*.*', 
        '!./src/scripts/{lib,lib/**}', 
        '!./src/scripts/component.js',
        '!./src/scripts/controlBar.js',
        '!./src/scripts/dynamicStyles.js',
        '!./src/styles/controlbar.css'
    ])
    .pipe( gulp.dest( './dist/' + currentFolder ) )
    .pipe(git.add())
    .pipe(git.commit('new public version'));

    function dateFolderName(){
    	var d = new Date();
    	return  ( d.getMonth() + 1 ) + '-' +
    			d.getDate() + '-' +
    			d.getFullYear() + '_' +
    			d.getHours() + '-' +
    			d.getMinutes() + '-' +
    			d.getSeconds();
    }

});

function inc(importance) {
    // get all the files to bump version in 
    return gulp.src(['./package.json'])
        // bump the version number in those files 
        .pipe(bump({type: importance}))
        // save it back to filesystem 
        .pipe(gulp.dest('./'))
        // commit the changed version number 
        .pipe(git.commit('bumps package version'))
        // read only one file to get the version number 
        .pipe(filter('package.json'))
        // **tag it in the repository** 
        .pipe(tag_version());
}

gulp.task('feature', function() { return inc('minor'); })
gulp.task('release', function() { return inc('major'); })
 
gulp.task('default', ['connect', 'watch']);

gulp.task('revision', function() {
	run_sequence('copy', 'replace', 'feature');
});

gulp.task('final', function() {
	run_sequence('copy', 'replace', 'release');
});
