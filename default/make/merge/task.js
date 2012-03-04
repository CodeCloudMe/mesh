var _     = require('underscore'),
fs        = require('fs'),
walkr     = require('walkr'),
path      = require('path'),
resolve   = require('resolve'),
step      = require('stepc'),
mkdirp    = require('mkdirp'),
async     = require('async'),
mergeDirs = require('./mergeDirs');


exports.validate = {
	'input': path.exists,
	'output': path.exists
}

exports.run = function(ops, next) {

	
	var srcDir       = ops.input,  
	targetPlatform   = ops.target,
	targetSrcDir     = srcDir + "/" + targetPlatform
	outputDir        = ops.output + "/" + targetPlatform,
	outputPkg        = outputDir + "/package.json",
	outputModulesDir = outputDir + "/node_modules",
	rootPkg          = readJSON(ops.cwd + "/package.json"),
	nodeModulesDir   = ops.cwd + "/node_modules",
	srcPkg           = {};



	step(

		/**
		 */

		function() {

			mkdirp(outputDir, 0777, this);

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

		next.success(function() {

			//at this point, it doesn't matter if the package.json exists. Default dir is src/
			this(null, readPackage(targetSrcDir));
		}),


		/**
		 */

		next.success(function(pkg) {

			srcPkg = pkg;


			walkr(targetSrcDir, outputDir).
			filter(pkg.src). //ommit the src dir for now
			filter(walkr.copy).
			start(this);

		}),

		/**
		 */

		next.success(function() {

			mergeDirs(srcDir, [targetPlatform]).
			mapDir(function(dir, next) {
				next(null, readPackage(dir).dir);
			}).
			filterFile(/package\.json/, mergeDirs.mergeJSON("package.json", rootPkg)).
			// filterFile(mergeDirs.parseTemplate({})).
			join(outputDir + "/" + (srcPkg.original.directories.src || '/')).
			complete(this);
		}),

		/**
		 */

		next.success(function() {
			var deps = Object.keys(readPackage(outputPkg).original.dependencies || {});
			// deps = deps.concat(Object.keys(rootPkg))
			this(null, deps);
		}),

		/**
		 */

		next.success(function(deps) {

			var pkgPaths = [];

			for(var i = deps.length; i--;) {
				pkgPaths.push(nodeModulesDir + "/" + deps[i]);
			}

			async.filter(pkgPaths, meshable, this);
		}),

		/**
		 */

		function(makeable) {

			async.forEach(makeable, 
				function(makePath, next) {

					var input = path.dirname(makePath);

					console.log("MAKE")
					/*ops = {
						input: path.dirnam
					}*/

				},
				this);

		},

		/**
		 */

		next.success(function() {

			next();			

			ops.cwd = targetSrcDir;

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
		src: path.normalize(dir + "/" + (dirs.src || 'src')),
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

function meshable(file, next) {
	next(!!readPackage(file).original.mesh);
}
