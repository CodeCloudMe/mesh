var fs = require("fs"),
sardines = require("sardines");


exports.params = {
}

exports.run = function(target, next) {

	var ops = target;


	/**
	 * first analyze the dependencies. This works a few ways:
	 *
	 * 1. dir specified, so scan ALL scripts, including third-party modules.
	 * 2. entry point specified, so scan ONLY scripts which are used ~ (look for require() stmts)
	 */


	if(!ops.entry) {
		ops.entry = ops.input;
	}

	if(!ops.method) {
		ops.method = "shrinkwrap";
	}

	ops.wrap = "?task=sardines&method=wrap";
	

	sardines(ops, next.success(function(content) {

		//next item should take this script
		ops.entry = ops.input = ops.output;

		fs.writeFile(ops.input, content, next);


	}));

}


exports.taskMessage = function(target) {
	return "shrinkwrap " + (target.entry || target.input);
}