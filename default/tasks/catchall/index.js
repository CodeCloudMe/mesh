var catchall = require('catchall'),
fs = require('fs'),
outcome = require("outcome");

module.exports = {
	"def catchall OR public/catchall": {
		"params": {
			"input": true,
			"output": true
		},
		"message": "<%-input %>",
		"run": run
	}
}

function run(target, next) {
	var data = target.get();
	catchall.load(data.input, outcome.error(next).success(function(wrappedSource) {
		target.set("input", data.output);
		fs.witeFile(data.output, wrappedSource, next);
	}));
}

