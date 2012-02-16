var analyzeDeps = require('./analyzeDeps'),
_ 	            = require('underscore'),
async           = require('async'),
combineScripts  = require('./combineScripts'),
outcome         = require('outcome');

exports.build = function(target, next) {

	var ops = target.options,
	on      = outcome.error(next);


	/**
	 * first analyze the dependencies. This works a few ways:
	 *
	 * 1. dir specified, so scan ALL scripts, including third-party modules.
	 * 2. entry point specified, so scan ONLY scripts which are used ~ (look for require() stmts)
	 */


	var include = [ops.entry].concat(ops.include || []);

	for(var i = include.length; i--;) {
		include[i] = target.cwd + "/" + include[i];
	}

	
	analyzeDeps({ entries: include }, on.success(function(deps) {

		//next item should take this script
		ops.entry = ops.input = ops.output;

		combineScripts({
			include: deps,
			entries: [deps[0]]
		}, on.success(function(content) {
			fs.writeFile(target.cwd + "/" + ops.input, content, next);
		}))
	}));
}


exports.buildMessage = function(target) {
	return "combining " + target.options.entry;
}