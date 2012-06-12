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
	catchall.load(target.input, outcome.error(next).success(function(wrappedSource) {
		fs.witeFile(target.output, wrappedSource, next);
	}));
}

