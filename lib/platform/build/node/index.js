var ncp = require('ncp'),
fs = require('fs');


module.exports = function(ops, next) {
	
	var manifest = ops.manifest;


	ncp(ops.src, ops.dest, function(err) {

		var pkgSrc = ops.dest + '/package.json', main;

		var pkg = JSON.parse(fs.readFileSync(pkgSrc, 'utf8'));

		//copy the manifest vars over to the package.json file
		pkg.name 		= pkg.name || manifest.name;
		pkg.description = pkg.description || manifest.description;

		//the main script
		main = ops.dest + '/' + pkg.main;

		//replace the main with the actual entry point.
		pkg.main = ops.dest + '/' + ops.mainScript;


		//re-write the package.json file
		fs.writeFileSync(pkgSrc, JSON.stringify(pkg, null, 2));

		//no error, continue.
		next(null, {
			entries: [ main ]
		});
	});

}