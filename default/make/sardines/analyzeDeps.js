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
 * scans the target entry for dependencies
 */

 module.exports = function(ops, callback) {

 	//include these entry points - .JS files, directories, whatever.
 	var entries = ops.entries;


 	//dependencies already found
 	var __loaded = { used: {}, files: [] };

 	/**
 	 */

 	var isUsed = function(script) {
 		return !!__loaded.used[script.alias];
 	}

 	/**
 	 */

 	var use = function(script) {
 		__loaded.used[script.alias] = true;
 		__loaded.files.push(script);
 	}


 	/**
 	 * finds all 
 	 */

 	var includeScript = function(script, callback) {
 				
 		// if(isUsed(script)) console.log(script.alias);

 		//script already used? skip.
 		if(isUsed(script)) return callback();
 		use(script);

 		var on = outcome.error(callback);


 		step(

 			/** 
 			 * first get the dependencies
 			 */

 			function() {

 				findDeps(script.path, this);

 			},

 			/**
 			 * deps found? load THOSE in!
 			 */

 			on.success(function(deps) {

 				async.forEach(deps, includeScript, this);

 			}),

 			/**
 			 */

 			callback
 		)
 	}

 				
 	/**
	 * includes ALL scripts in the given directory
	 */

	var includeDir = exports.includeDir = function(dir, callback) {
		

		var on = outcome.error(callback);

		step(

			/**
			 * first scan for all the scripts in the given directory recursively 
			 */

			function() {
				var inc = [], self = this;

				findFiles(dir, /\.js$/, function(file) {

					//the included dir MIGHT be a module, so make sure that's the starting point
					if(file.substr(file.indexOf(dir) + dir.length).indexOf('node_modules/') > -1) return;

					var script = getPathInfo(file);

					inc.push(script);

				}, on.success(function() {
					self(null, inc);
				}));
			},

			/**
			 * next include all the scripts loaded in 
			 */

			on.success(function(include) {

				//after 
				async.forEach(include, includeScript, this);

			}),

			/**
			 */

			callback
		)
	}
 	



 	/**
 	 entry point given
 	 */

 	var includeEntry = function(dirOrScript, callback) {
 		
 		var on = outcome.error(callback);

 		step(

 			/**
 			 */

			function() {

				fs.lstat(dirOrScript, this);

			},

			/**
			 */

			on.success(function(stats) {

				var self = this;

				//dir specified? scan EVERYTHING
				if(stats.isDirectory()) {

					includeDir(dirOrScript, this);

				//otherwise scan for require() statements
				} else {

					includeScript(getPathInfo(dirOrScript), this);

				}
			}),

			/**
			 */

			callback
		)
 	}

	/**  
	 * recursively includes the entry points to scan
	 */

	var init = function(entries, callback) {
		

		var on = outcome.error(callback);

		async.forEach(entries, includeEntry, on.success(function() {
			callback(null, __loaded.files);
		}));
	}


	init(entries, callback);
}

 



/**
 * scans content for required dependencies
 */

 var findDeps = module.exports.findDeps = function(entry, callback) {
		
	//incase getPathInfo stuff is passed...
	if(entry.path) entry = entry.path;

	var cwd    = path.dirname(entry),
	on         = outcome.error(callback);

	
	step(

		/**
		 */

		function() {

			fs.readFile(entry, "utf8", this);

		},

		/**
		 */

		on.success(function(content) {

			scanRequired(content, cwd, this);

		}),
		
		/**
		 */

		on.success(function(deps) {

			callback(null, deps);

		})
	);
}

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





