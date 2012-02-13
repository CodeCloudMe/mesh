var analyzeDeps = require('./analyzeDeps'),
analyzeDirs     = require('./analyzeDirs'),
_ 	            = require('underscore');

module.exports = function(target, next) {
	var ops = target.options;	




	analyzeDeps.includeProject(target.cwd + "/" + ops.input, function(err, deps) {

		console.log(deps);
		// console.log(deps);
	});
}