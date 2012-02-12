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
getPathInfo		= utils.getPathInfo;


/**
 * Scans for require() statements and returns a list of the dependencies
 * including package path, file path, is it a module? core module?
 */



/** 
 * the real entry point
 */

module.exports = function findAllDependencies(entry, callback) {

	var on = outcome.error(callback);

	step(
		function() {
			
			findDependenciesRecursive(entry, on.success(this));

		},
		function(files) {
			callback(null, files);
		}
	)
}

/**
 */


 var cachedDeps = {};

module.exports.findDependencies = function findDependencies(entry, callback) {
	
	var cwd    = path.dirname(entry),
	on         = outcome.error(callback);

	/*if(cachedDeps[entry]) {
		return callback(null, cachedDeps[entry]);
	}*/
	
	step(
		function() {

			fs.readFile(entry, "utf8", on.success(this));

		},

		function(content) {
			scanRequired(content, cwd, on.success(this));
		},
	
		function(deps) {

			callback(null, deps);
		}
	);
}


/**
 * recursively looks for dependencies starting from a target
 * entry point
 */

function findDependenciesRecursive(entry, callback, loaded) {


	//loaded - files already scanned
	if(!loaded) loaded = { modules: {}, filesByPath: {}, files: [] };

	var on = outcome.error(callback),
	cwd    = path.dirname(entry);

	step(

		function() {

			findDependencies(entry, on.success(this));

		},

		function(required) {

			var usable = [];


			required.forEach(function(pi) {
				
				//skip all the files we've already scanned
				if(loaded.filesByPath[pi.path] || (pi.moduleName && loaded.modules[pi.moduleName])) return;

				loaded.filesByPath[pi.path] = pi;
				loaded.files.push(pi);

				//module? make sure not to check the module twice - it CAN be used in other dependencies
				if(pi.module && pi.moduleName) loaded.modules[pi.moduleName] = true;

				if(!pi.core) usable.push(pi);
			});


			async.forEach(usable,
				function(pi, next) {
					findDependenciesRecursive(pi.path, next, loaded);
				},
				function() {
					callback(null, loaded.files);
				}
			)

		}
	);
}


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




