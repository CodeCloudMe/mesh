var async       = require('async'),
step            = require('stepc'),
outcome         = require('outcome'),
utils           = require('./utils'),
isMain          = utils.isMain
findPackagePath = utils.findPackagePath,
loadPackage     = utils.loadPackage,
findFiles       = utils.findFiles,
mainScriptPath  = utils.mainScriptPath,
getPathInfo		= utils.getPathInfo,
path            = require('path'),
findDeps        = require('./analyzeDeps').findDependencies;


/**
 * analyzes directories for dependencies - simpler than analyzeDeps. Package.json is the only
 * thing we look for
 */


 module.exports = function findAllDependencies(dir, callback) {
 	
 	includeDir(dir, callback)
 }



 function includeDir(dir, callback) {
 	
 	var includeFiles = [], mainDir;

 	var on = outcome.error(callback);
 	

 	step(
 		
 		function() {


 			var next = this,
 			scanFiles = [];

 			findFiles(dir, /\.js$/, function(file) {

 				if(file.indexOf('node_modules') > -1) return;

 				scanFiles.push(file);
 				includeFiles.push(getPathInfo(file));

 			},
	 		on.success(function() {
	 			next(scanFiles);
	 		}));

		 	
 		},

 		function(scanFiles) {

 			var self = this;

 			async.map(scanFiles, findDeps, on.success(this));

 		},

 		function(required) {

 			flattened = Array.prototype.concat.apply([], required),
 			used = {};

 			//only want modules, and no fucking dupes. Core modules are coo' though...
 			flattened = flattened.filter(function(info) {
 				var usable = !used[info.path] && ((info.module && info.isMain) || info.core);
 				used[info.path] = 1;
 				return usable;
 			});


 			//include the target files, *and* third party modules we scanned in.
 			var allFiles = includeFiles.concat(flattened);

 			this(allFiles);
 		},

 		function(allFiles) {
 			callback(null, allFiles);
 		}

 	)
 }
