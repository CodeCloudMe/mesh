var path = require('path'),
fs       = require('fs'),
path     = require('path'),
step     = require('stepc'),
outcome  = require('outcome'),
async    = require('async'),
resolve         = require('resolve');

var cachedPackages = {};

/**
 * finds the package of a given module
 */

exports.findPackagePath = function(dir) {
	
	var found = null;

	return exports.eachDir(dir, function(dir) {
		try {
			
			var pkgPath = dir + "/package.json"

			//throws error
			fs.lstatSync(pkgPath);
			
			return pkgPath;

		} catch(e) {
			
		}
	});
	
	return found;
}

/**
 */

exports.loadPackage = function(pkgPath) {
	return cachedPackages[pkgPath] || (cachedPackages[pkgPath] = JSON.parse(fs.readFileSync(pkgPath, "utf8")));
}

/**
 */

exports.mainScriptPath = function(pkgPath) {
	return path.normalize(path.dirname(pkgPath) + "/" + exports.loadPackage(pkgPath).main);
}


/**
 */

exports.eachDir = function(dir, each) {
	
	pathParts = dir.split('/');
	var result;
	while(pathParts.length) {
		if((result = each(pathParts.join("/"))) !== undefined) return result;
		pathParts.pop();
	}
}

/**
 */

exports.isMain = function(scriptPath, pkgPath) {
	return scriptPath == exports.mainScriptPath(pkgPath);
}


/**
 */

exports.findFiles = function(file, search, onFile, onEnd) {

	var seen = {}, on = outcome.error(onEnd);


	function scanFile(file, callback) {

		step(
			function() {
				fs.lstat(file, on.success(this));
			},
			function(stat) {

				if(stat.isDirectory()) {
					return scanDir(file, callback);	
				}
				
				if(!search.test(file)) return callback();

				onFile(file);
				this();
			},
			function() {
				callback();
			}
		)
	}

	function scanDir(dir, callback) {

		//already scanned? prob symlink
		if(seen[dir]) return callback();

		seen[dir] = true;

		step(
			function() {
				fs.readdir(dir, on.success(this));
			},
			function(files) {

				var usable = [];

				for(var i = files.length; i--;) {
					var file = files[i];

					if(file.substr(0, 1) == '.') continue;

					usable.push(path.normalize(dir + "/" + file));
				}

				async.forEach(usable, scanFile, this);
			},
			function() {
				callback();
			}
		)
	}

	//entry point.
	scanFile(file, onEnd);



}


/**
 * gets info about the given js file - core module? third-party? relative?
 */

exports.getPathInfo = function(required, cwd) {
	
	//relative?
	/*if(cwd && required.substr(0, 1) == ".") {
		return { path: require.resolve(cwd + "/" + required) };
	}*/

	try {

		
		var realPath = resolvePath(required, cwd),
		pkgPath      = exports.findPackagePath(path.dirname(realPath)),
		name         = pkgPath ? getPackageName(pkgPath) : null,
		im           = pkgPath ? exports.isMain(realPath, pkgPath) : pkgPath;
 	
		return {

			stmt: required,

			path: realPath,

			//name of the module IF it exists
			moduleName: name,

			//path to package.json - yep it's a module
			pkgPath: pkgPath,

			pathFromPkg: (realPath || '').replace(path.dirname(pkgPath), "."),

			//module? - core, or third party
			module: required.substr(0,1) != '.',

			isMain: !!im,

			//built into node?
			core: realPath && realPath.split('/').length == 1
		};

	} catch(e) {
		//something went wront
		return {
			stmt: required,
			error: e
		};
	}
}


/**
 * RELATIVE require.resolve to cwd since we might
 * be going into module dirs - we want to find relative modules to modules...
 */

function resolvePath(module, cwd) {

	
	return resolve.sync(module, {
		basedir: cwd
	});

	if(cwd && module.substr(0, 1) == ".") {
		return require.resolve(cwd + "/" + module);
	}

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
 * returns the package name
 */

var getPackageName = module.exports.getPackageName = function(pkgPath) {
	try {
		return loadPackage(pkgPath).name;
	} catch(e) {
		return null;
	}
}