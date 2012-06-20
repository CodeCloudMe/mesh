var _     = require('underscore'),
fs        = require('fs'),
walkr     = require('walkr'),
path      = require('path'),
resolve   = require('resolve'),
step      = require('stepc'),
mkdirp    = require('mkdirp'),
async     = require('async'),
mergeDirs = require('./mergeDirs'),
outcome   = require('outcome'),
sprintf   = require('sprintf').sprintf;

_.str = require('underscore.string');


module.exports = {
	"def merge OR merge/:target": {
		"params": {
			"directories.src": true,
			"directories.lib": true,
			"target": true
		},
		"description": "merges multiple dirs into one",
		"run": run
	}
}

function run(target, next) {

	var data = target.get(),
	on = outcome.error(next);


	var dirs       = data.directories || {},
	srcDir         = data.input || dirs.src,
	odir           = data.output || dirs.lib,
	targetPlatform = data.target || data.task.split(':').shift(),
	platforms      = _.uniq(data.platforms ? data.platforms.concat(targetPlatform) : [targetPlatform]);
		
	if(!srcDir || !odir || !targetPlatform) {
		throw new Error("Missing src, lib, or platform");
	}

	var outputDir    = odir + "/" + targetPlatform,
	targetSrcDir     = srcDir + "/" + targetPlatform,
	outputPkg        = outputDir + "/package.json",
	outputModulesDir = outputDir + "/node_modules",
	rootPkg          = readJSON(data.cwd + "/package.json"),
	nodeModulesDir   = data.cwd + "/node_modules",
	srcPkg           = {},
	strict 			 = data.strict == undefined ? true : data.strict,
	linkTo           = data.link;


	target.logger.logCommand("merge", _.str.rpad(rootPkg.name + " ", 0,' ') + "-> " + path.relative(data.root || data.cwd, outputDir));
	// console.log(sprintf('==> merge %s-> %s', _.str.rpad(rootPkg.name + " ", 0,' '), path.relative(data.root || data.cwd, outputDir)));

	step(

		/**
		 */

		function() {

			path.exists(targetSrcDir, this);

		},

		/**
		 */

		function(exists) {


			//strict may not always be appopriate - if an app is using a third party lib
			//and all that exists is a common lib - we don't want this getting caught
			if(!exists && strict) return next(new Error(sprintf('"%s" is not a valid target', targetPlatform)));

			mkdirp(outputModulesDir, 0777, this);

		},


		/**
		 */

		function() {

			fs.writeFileSync(outputPkg, JSON.stringify(rootPkg, null, 2));

			this();
		},

		/**
		 */

		function() {

			fs.readdir(nodeModulesDir, this);
		},

		/**
		 */

		function(err, dirs) {

			//node_modules does NOT exist
			if(err) {
				return this();
			}

			async.forEach(dirs,
				function(dir, next) {
					fs.symlink(nodeModulesDir + "/" + dir, outputModulesDir + "/" + dir, function() {
						next();
					});
				},
				this);
		},

		/**
		 */

		on.success(function() {
			linkToParent(outputDir, linkTo, this);
		}),

		/**
		 */

		function() {

			//at this point, it doesn't matter if the package.json exists. Default dir is src/
			this(null, readPackage(targetSrcDir));
		},


		/**
		 */

		on.success(function(pkg) {

			srcPkg = pkg;
			
			platforms = _.uniq(platforms.concat(pkg.original.platforms || []));

			walkr(targetSrcDir, outputDir).
			filter(pkg.src). //ommit the src dir for now
			filter(/\/package.json/).
			filter(walkr.copy).
			start(this);

		}),

		/**
		 */

		on.success(function() {

			mergeDirs(srcDir, platforms).
			mapDir(function(dir, next) {
				next(null, readPackage(dir).src);
			}).
			filterFile(/\/package\.json/, mergeDirs.mergeJSON("package.json")).
			// filterFile(mergeDirs.parseTemplate({})).
			join(outputDir + "/" + (srcPkg.original.directories.src || '/')).
			complete(this);
		}),

		/**
		 */

		on.success(function() {
			var deps = Object.keys(readPackage(outputPkg).original.dependencies || {});
			// deps = deps.concat(Object.keys(rootPkg))
			this(null, deps);
		}),

		/**
		 */

		on.success(function(deps) {

			var pkgPaths = [];

			for(var i = deps.length; i--;) {
				pkgPaths.push(readPackage(nodeModulesDir + "/" + deps[i]));
			}


			async.filter(pkgPaths, meshable, this);
		}),

		/**
		 */

		function(makeable) {

			async.forEach(makeable, 
				function(pkg, next) {

					var child = target.child({
						input: pkg.src,
						output: pkg.lib,
						cwd: pkg.dir,
						target: targetPlatform,
						root: data.root || data.cwd,
						platforms: platforms,
						strict: false,
						link: outputModulesDir + "/" + path.basename(pkg.dir)
					});

					child.logger = target.logger;

					run(child, outcome(next).error(next).success(next));
				},
				this);

		},

		/**
		 */

		on.success(function() {

			next();			
		})

	);
}


/**
 */

function readPackage(pkgPath) {

	if(pkgPath.indexOf('package.json') == -1) {
		pkgPath += "/package.json";
	}

	var pkg = readJSON(pkgPath),
	dir = path.dirname(pkgPath);


	if(!pkg.directories) {
		pkg.directories = {};
	}

	var dirs = pkg.directories;



	var cfg = {
		dir: dir,
		src: path.normalize(dir + "/" + (dirs.src || '')),
		lib: path.normalize(dir + "/" + (dirs.lib || 'lib')),
		original: pkg
	};

	return cfg;
}

/**
 */

function readJSON(cfgPath) {

	try {

		return JSON.parse(fs.readFileSync(cfgPath, "utf8"));

	} catch(e) {

		return {};

	}
}

/**
 */

function linkToParent(outputDir, to, next) {

	if(!to) return next();

	step(
		function() {
			fs.unlink(to, this);
		},
		function() {
			fs.symlink(outputDir, to, this);
		},
		next
	);

}


/**
 */

function meshable(pkg, next) {

	var meshable = !!pkg.original.mesh;

	if(!meshable) {
		//for debugging
		//console.log("skip " + pkg.original.name);
	}

	next(meshable);
}
