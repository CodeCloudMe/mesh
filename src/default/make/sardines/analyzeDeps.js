var outcome = require("outcome"),
step        = require("stepc"),
fs          = require("fs"),
async       = require("async"),
path        = require("path"),
_           = require("underscore");




/** 
 * the real entry point
 */

module.exports = function findAllDependencies(entry, callback) {

	var on = outcome.error(callback);

	step(
		function() {
			
			findDependencies(entry, on.success(this));

		},
		function(files) {
			console.log(files.length)
		}
	)
}


/**
 * recursively looks for dependencies starting from a target
 * entry point
 */

function findDependencies(entry, callback, loaded) {


	//loaded - files already scanned
	if(!loaded) loaded = { modules: {}, filesByPath: {}, files: [] };

	var on = outcome.error(callback),
	cwd    = path.dirname(entry);

	step(

		function() {

			fs.readFile(entry, "utf8", on.success(this));

		},

		function(content) {


			scanRequired(content, cwd, on.success(this));

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
					findDependencies(pi.path, next, loaded);
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
	pathInfo = []



	async.forEach(required, function(fn, next) {

		relPath = fn.match(/["'](.*?)["']/)[1]

		var pi = getPathInfo(relPath, cwd);

		if(pi) pathInfo.push(pi);

		return next();

	}, function() {
		
		callback(null, pathInfo);
	})
}

/**
 * gets info about the given js file - core module? third-party? relative?
 */

function getPathInfo(required, cwd) {
	
	//relative?
	if(cwd && required.substr(0, 1) == ".") {
		return { path: require.resolve(cwd + "/" + required) };
	}

	try {

		
		var realPath = resolvePath(required, cwd),
		pkgPath      = findPackagePath(realPath),
		name         = pkgPath ? getPackageName(pkgPath) : null;

		return {
			path: realPath,

			//name of the module IF it exists
			moduleName: name,

			//path to package.json - yep it's a module
			pkgPath: pkgPath,

			//module? - core, or third party
			module: true,

			//built into node?
			core: realPath && realPath.split('/').length == 1
		};

	} catch(e) {
		console.error("cannot get path info for " + required);
		//something went wront
		return null
	}
}

/**
 * RELATIVE require.resolve to cwd since we might
 * be going into module dirs - we want to find relative modules to modules...
 */

function resolvePath(module, cwd) {

	//not local?
	try {
		return require.resolve(module);
	} catch(e) {
		return null;
	}

	return eachDir(cwd, function(dir) {

		try {
			var moduleDir = dir + '/node_modules/' + module;

			fs.lstatSync(moduleDir);
				
			//this is a bit redundant since we're about to load the package *again* - cache?
			return path.normalize(moduleDir + "/" + loadPackage(moduleDir + "/package.json").main);
		} catch(e) {
			
		}
	});

}

/**
 * finds the package of a given module
 */

function findPackagePath(file) {
	
	var found = null;

	return eachDir(path.dirname(file), function(dir) {
		try {
			
			var pkgPath = dir + "/package.json"

			//throws error
			fs.lstatSync(pkgPath)
			
			return pkgPath;

		} catch(e) {
			
		}
	});
	
	return found;
}

/**
 * loops through each dir
 */


function eachDir(dir, each) {
	
	pathParts = dir.split('/');
	var result;
	while(pathParts.length) {
		if((result = each(pathParts.join("/"))) !== undefined) return result;
		pathParts.pop();
	}
}


/**
 * returns the package name
 */

function getPackageName(pkgPath) {
	return loadPackage(pkgPath).name;
}

/**
 */

function loadPackage(pkgPath) {
	return JSON.parse(fs.readFileSync(pkgPath, "utf8"));	
}



module.exports("/Users/craig/Dropbox/Developer/Jobs/Spice/private/spice.io/bootstrap.js");