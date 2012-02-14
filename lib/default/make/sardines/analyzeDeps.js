var outcome     = require("outcome"),
step            = require("stepc"),
fs              = require("fs"),
async           = require("async"),
path            = require("path"),
_               = require("underscore"),
utils           = require('./utils'),
findPackagePath = utils.findPackagePath,
isMain          = utils.isMain,  
eachDir         = utils.eachDir,
loadPackage     = utils.loadPackage,
getPathInfo		= utils.getPathInfo,
findFiles		= utils.findFiles,
getPkgName      = utils.getPackageName,
mainScriptPath  = utils.mainScriptPath;


/**
 * Scans for require() statements and returns a list of the dependencies
 * including package path, file path, is it a module? core module?
 */



/**
 
 After playing around a bit with combining sauce code, I've come up with a few rules:
 
 1. The script which combines node.js source code should NOT rely on scanning for "require()". Lots of times "require()" isn't explictly defined, so
 source code MIGHT be left out (haba for example)
 2. The script requires a directory to scan - from there ALL dependencies are included.
 3. third-party modules are scanned from the included dependencies - my guess is they're explictly defined.
 4. IF files are not explictly defined, they can always be included in manually.

 Bottom line - combining scripts should be very thin, and should try to guess WHAT scripts to include. Include it all, and let
 the DEVELOPER explicitly define with scripts to include, and what NOT to include 

 */




/**
 * scans the target entry for dependencies
 */


 var cachedDeps = {};

var findDeps = module.exports.findDependencies = function(entry, callback) {
	
	//incase getPathInfo stuff is passed...
	if(entry.path) entry = entry.path;

	var cwd    = path.dirname(entry),
	on         = outcome.error(callback);

	
	step(
		function() {

			fs.readFile(entry, "utf8", this);

		},

		on.success(function(content) {
			scanRequired(content, cwd, this);
		}),
	
		on.success(function(deps) {

			callback(null, deps);
		})
	);
}


/**
 * recursively scans package dependencies, and ALL sources of the given
 * dependency
 */

var filterUsedPkgs = function(pkgs) {
	var used = {};
	return pkgs.filter(function(pkg) {
		var bn = getPkgName(pkg);
		if(used[bn]) return false;
		used[bn] = true;
		return true;
	});
}


/**
 * recursively finds all dependencies starting from the target package(s)
 */

var allPkgs = exports.allPkgs = function(pkgPath, callback) {

	if(pkgPath instanceof Array) {
		return async.map(pkgPath, allPkgs, function(err, map) {
			callback(err, filterUsedPkgs(flatten3d(map)));
		});
	}
	
	var on = outcome.error(callback),
	pkg;

	step(
		function() {
			fs.readFile(pkgPath, "utf8", this);
		},
		on.success(function(content) {
			try
			{
				
				pkg = JSON.parse(content);

			} catch(e) {
				console.error('cannot parse package %s', pkgPath);
				return this([[]]);	
			}

			async.map(Object.keys(pkg.dependencies || {}),
			function(dep, next) {
				var depInfo = getPathInfo(dep, path.dirname(pkgPath));
				allPkgs(depInfo.pkgPath, next);
			},
			this);
		}),
		on.success(function(deps) {
			this(null, filterUsedPkgs(flatten3d([pkgPath], deps)))
		}),
		on.success(function(flattened) {
			callback(null, flattened);
		})
	)
}


/**
 * explictly scans for require() stmt to load any dependencies
 */


var findRequiredDeps = exports.findRequiredDeps = function(entry, callback, loaded) {
	
	var root = false;

	if(!loaded) {
		loaded = { filesByKey:{}, modules:[], files: [] };
		root = true;
	}

	var on = outcome.error(callback);


	step(
		function() {
			findDeps(entry, this);
		},
		on.success(function(deps) {

			var usable = [];


			deps.forEach(function(dep) {

				if(dep.error) return;

				var key = dep.module ? dep.moduleName : dep.path;

				if(loaded.filesByKey[key]) return;
				loaded.filesByKey[key] = true;

				if(dep.core || dep.stmt.substr(0,1) == '.') {
					
					usable.push(dep);
					loaded.files.push(dep);
				} else
				if(dep.module) {
					loaded.modules.push(dep.pkgPath);
					return;
				} 
				

				
			})


			var self = this;

			async.map(usable, function(dep, next) {
				findRequiredDeps(dep.path, next, loaded);
			}, this)
		}),
		on.success(function() {

			var ret = loaded.files;

			if(root) {
				ret.unshift(getPathInfo(entry));
			}

			callback(null, { required: ret, modules: loaded.modules });
		})
	)
}





/**
 * includes ALL scripts in the given directory
 */

var includeDir = exports.includeDir = function(dir, callback) {
	

	var on = outcome.error(callback);

	step(
		function() {
			var inc = [], self = this;

			findFiles(dir, /\.js$/, function(file) {

				//the included dir MIGHT be a module, so make sure that's the starting point
				if(file.substr(file.indexOf(dir) + dir.length).indexOf('node_modules/') > -1) return;

				inc.push(getPathInfo(file));
			}, on.success(function() {
				self(null, inc);
			}));
		},

		on.success(function(include) {
			callback(null, include);
		})
	)
}


/**
 * scans the given inputs for THIRD-PARTY dependencies
 * and recursively includes all modules, including modules, of third-party modules.
 * note that it ALSO makes sure that there are no overlapping third-party modules - some may use a common library twice
 * such as underscore.
 *
 * Unlike including the ENTIRE dependency, it's scanned for use of "require()" - there are many cases when the entry point is 
 * in the same directory as other test scripts - those need to be ignored, and there isn't way to parse those out without EXPLICTLY
 * looking for require()
 */

var includeRequiredThirdPartyDeps = exports.includeRequiredThirdPartyDeps = function(files, callback) {
	
	var on = outcome.error(callback),
	builtin = [];

	step(

		/**
		 * first scan for ALL required items
		 */

		function() {
			async.map(files, findDeps, this);
		},

		/**
		 */

		on.success(function(required) {
			var flattened = flatten3d(required),
			used = {},
			pkgs = [];

			//only the packages
			flattened.forEach(function(info) {


				//wrapped around incase the package is not properly formatted
				try
				{
					//fetch the module name from the package itself
					var moduleName = getPkgName(info.pkgPath);
				} catch(e) {
					console.error(e.stack);
					return; // do not include
				}


				if(info.module && !used[moduleName]) {
					used[moduleName] = true;
					pkgs.push(info.pkgPath);
				}
			});

			allPkgs(pkgs, this);
		}),

		on.success(function(pkgs) {


			async.map(pkgs, function(pkg, next) {

				try
				{
					var script = require.resolve(path.dirname(pkg));
				} catch(e) { 
					console.error(e.stack);
					return next(null, null);
				}


				findRequiredDeps(script, outcome.error(next).success(function(inf) {

					next(null, inf.required);
				}));

			}, this);
		}),

		on.success(function(files) {
			var flattened = flatten3d(files);

			callback(null, flattened);
		})
	);
	
}


/**  
 * recursively includes the given directory, and all the scripts with it
 * it will also check in the given scripts for any third-party dependencies.
 *
 */

var includeProject = exports.includeProject = function(dirOrScript, callback) {
	

	var on = outcome.error(callback);

	step(


		function() {

			fs.lstat(dirOrScript, this);
		},

		on.success(function(stats) {

			var self = this;

			//dir specified? scan EVERYTHING
			if(stats.isDirectory()) {

				includeDir(dirOrScript, this);

			//otherwise scan for require() statements
			} else {

				findRequiredDeps(dirOrScript, on.success(function(result) {
					// result.required.unshift(getPathInfo)
					self(null, result.required);		
				}));

			}
		}),


		/**
		 * next need to scan 
		 */

		on.success(function(include) {
			
			var self = this;

			includeRequiredThirdPartyDeps(include, on.error(callback).success(function(includeThirdParty) {
				
				self(null, include.concat(includeThirdParty));	
			}));

		}),

		/**
		 */

		on.success(function(deps) {
			callback(null, deps);
		})
	)
}

// includeProject('/Users/craig/Dropbox/Developer/Jobs/Spice/private/spice.io/', function() {})

/*allPkgDeps("/Users/craig/Dropbox/Developer/Jobs/Spice/private/spice.io/package.json", function(err, pkgs) {

		console.log(pkgs)
		
	})

findDepsRecursive("/Users/craig/Dropbox/Developer/Jobs/Spice/private/spice.io/index.js", function(err, results) {
	
	var used = {};

	allPkgDeps(results.modules, function(err, pkgs) {

		// console.log(pkgs)
		
	})


	// console.log(results.modules)
})*


/**
 * scans content for required dependencies
 */

function scanRequired(content, cwd, callback) {

	//for speed. 
	var required = String(content).match(/require\(["'].*?["']\)/g) || [],
	pathInfo = [];


	async.forEach(required, function(fn, next) {

		relPath = fn.match(/["'](.*?)["']/)[1]

		var pi = getPathInfo(relPath, cwd);

		pathInfo.push(pi);

		return next();

	}, function() {
		
		callback(null, pathInfo);
	})
}

function flatten2d(target) {
	return Array.prototype.concat.apply([], target);
}

function flatten3d() {
	return flatten2d(flatten2d(arguments));
}





