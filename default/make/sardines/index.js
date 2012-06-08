var fs = require("fs"),
sardines = require("sardines");


exports.params = {
	entry: true
}

exports.run = function(target, next) {

	var ops = target;


	/**
	 * first analyze the dependencies. This works a few ways:
	 *
	 * 1. dir specified, so scan ALL scripts, including third-party modules.
	 * 2. entry point specified, so scan ONLY scripts which are used ~ (look for require() stmts)
	 */


	var include = [ops.entry].concat(ops.include || []);

	/*for(var i = include.length; i--;) {
		include[i] = target.cwd + "/" + include[i];
		}*/

	sardines.shrinkwrap(ops, next.success(function(content) {

		//next item should take this script
		ops.entry = ops.input = ops.output;


		fs.writeFile(ops.input, content, next);

	}));

}


exports.taskMessage = function(target) {
	return "shrinkwrap " + target.entry;
}