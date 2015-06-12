/*global require*/
"uses script";

var gulp = require("gulp"),
	path = require("path"),
	fs,
	msgErrs = {};

;
(function() {
	try {
		fs = require("fs-extra");
	} catch (ex) {
		fs = require("fs");
	}
})();



/**
 * 编译
 */
function complier(opt) {
	var less = require("gulp-less"),
		uglify = require("gulp-uglify"),
		autoprefixer = require("gulp-autoprefixer"),
		minifycss = require("gulp-minify-css"),
		imagemin = require("gulp-imagemin"),
		rename = require("gulp-rename"),
		clean = require("gulp-clean"),
		concat = require("gulp-concat"),
		notify = require("gulp-notify"),
		replace = require("gulp-replace"),
		plumber = require("gulp-plumber"),
		filter = require("gulp-filter"),
		gulpif = require("gulp-if"),
		wraper = require("gulp-wrapper"),
		// livereload = require("gulp-livereload");
		browserSync = require("browser-sync");

	var css = opt.css,
		js = opt.js;

	var util = {
		css: function(files) {
			files
				.pipe(plumber({ //错误处理
					errorHandler: errrHandler
				}))
				.pipe(gulpif(css.filter && css.filter.length, filter(css.filter)))
				.pipe(less())
				.pipe(autoprefixer({
					browsers: ["last 3 version", "ie > 8", "Android >= 3", "Safari >= 5.1", "iOS >= 5"]
				}))
				.pipe(minifycss({
					compatibility: 'ie6'
				}))
				.pipe(gulp.dest(css.dest))
				.pipe(browserSync.stream()) //browser sync 插入css
				.pipe(notify({
					message: "CSS 编译编译成功!"
				}));
		},
		js: function(files) {
			files
				.pipe(plumber({ //错误处理
					errorHandler: errrHandler
				}))
				.pipe(gulpif(js.filter && js.filter.length, filter(js.filter)))
				.pipe(gulpif(!opt.debug, uglify()))
				.pipe(gulp.dest(js.dest))
				.pipe(notify({
					message: "JS 编译成功！"
				}));
		}
	}

	/*CSS 处理*/
	util.css(gulp.src(css.src + "**/*.less"));

	/*JS 处理*/
	util.js(gulp.src(js.src + "**/*.js"));

	/*监控文件改变*/
	gulp
		.watch(css.src + "**/*.less", function(files) {
			util.css(gulp.src(files.path));
		});
	gulp
		.watch(js.src + "**/*.js", function(files) {
			util.js(gulp.src(files.path));
		});

	// setTimeout(function() {
	// 	console.log("-------live reload 开始监视---------");
	// 	livereload.listen();
	// 	gulp.watch([js.dest + "**/*.js", css.dest + "**/*.css", opt.rootPath + "**/*.html"], livereload.changed);
	// }, 3000);

	setTimeout(function() {
		console.log("-------browser sync 开始监视---------");

		browserSync.init({
			server: {
				baseDir: opt.rootPath
			}
		});

		gulp.watch([opt.rootPath + "**/*.html", js.dest + "**/*.js"], browserSync.reload);
	}, 3000);

}

/**
 * 寻找项目根目录
 * @return {String} 项目根目录地址
 */
function findRoot() {
	var dir = process.argv.indexOf("--path"),
		i;
	return dir >= 0 ? process.argv[dir + 1] : (function() {
		var paths = [".", "../test"];
		for (i = 0; i < paths.length; i++) {
			dir = paths[i];
			if (fs.existsSync(path.join(dir, "index.php"))) {
				return dir;
			}
		}
		return ".";
	})();
}

/**
 * 读取JSON格式文件
 * @param   {String}        file        文件路径
 * @param   {Function}  callback    数据返回接口回调
 */
function readJSON(file, callback) {
	fs.readFile(file, {
		encoding: "utf-8"
	}, function(err, jsonstr) {
		if (!err) {
			try {
				callback(JSON.parse(jsonstr));
			} catch (ex) {
				callback(eval.call({}, "(" + jsonstr + ")"));
			}
		}
	});
}

/**
 * 异常处理
 * @param  {Error} e 错误对象
 */
function errrHandler(e) {
	var msg = e.toString().replace(/\x1B\[\d+m/g, ""),
		msgbox = require("native-msg-box");
	if (!msgErrs[msg]) {
		msgErrs[msg] = msg;
		if (e.plugin === "gulp-less") {
			console.log(JSON.stringify(e, 0, 4).trim() || msg);
		}
		msgbox.prompt({
			msg: msg,
			title: "gulp throw a error"
		}, function() {
			msgErrs[msg] = null;
		});
	}
}

gulp.task("default", function() {
	var root = findRoot();
	complier({
		rootPath: root,
		css: {
			src: path.join(root, "css.src/"),
			dest: path.join(root, "css/"),
			filter: ["**/*.less", "!**/*.module.less"]
		},
		js: {
			src: path.join(root, "js.src/"),
			dest: path.join(root, "js/"),
			filter: []
		},
		debug: process.argv.indexOf("--debug") > 0 //调试模式
	});
});