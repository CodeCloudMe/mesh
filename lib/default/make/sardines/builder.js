var analyzeDeps = require('./analyzeDeps'),
_ 	            = require('underscore'),
async           = require('async'),
combineScripts  = require('./combineScripts'),
outcome         = require('outcome');

module.exports = function(target, next) {

	var ops = target.options,
	on      = outcome.error(next);


	/**
	 * first analyze the dependencies. This works a few ways:
	 *
	 * 1. dir specified, so scan ALL scripts, including third-party modules.
	 * 2. entry point specified, so scan ONLY scripts which are used ~ (look for require() stmts)
	 */

	analyzeDeps.includeProject(target.cwd + "/" + ops.input, function(err, deps) {

		//next item should take this script
		ops.input = ops.output;
		
		combineScripts({
			include: deps
		}, on.success(function(content) {
			fs.writeFile(target.cwd + "/" + ops.input, content, next);
		}))
	});
}