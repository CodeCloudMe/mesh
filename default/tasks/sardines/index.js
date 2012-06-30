var fs = require("fs"),
sardines = require("sardines"),
outcome = require("outcome");

module.exports = {
	"def sardines OR public/sardines": {
		"params": {
			"input": true,
			"output": true,
			"method": function(target) {
				return target.get().method || "shrinkwrap";
			}
		},
		"description": "browserifies javascript code",
		"message": "<%-method %> <%-input %>",
		"run": run
	}
}

function run(target, next) {

	var data = target.get();

	/**
	 * first analyze the dependencies. This works a few ways:
	 *
	 * 1. dir specified, so scan ALL scripts, including third-party modules.
	 * 2. entry point specified, so scan ONLY scripts which are used ~ (look for require() stmts)
	 */

	if(data.input) {
		data.entry = data.input;
	}

	if(!data.method) {
		data.method = "shrinkwrap";
	}

	data.wrap = "?task=sardines&method=wrap";

	try {
		fs.unlinkSync(data.output);
	}catch(e) {
		
	}

	sardines(data, outcome.error(next).success(function(content) {

		//next item should take this script
		target.set("input", data.output);

		fs.writeFile(data.output, content, next);
	}));

}
