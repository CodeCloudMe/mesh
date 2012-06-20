var walkr = require("walkr"),
outcome   = require("outcome"),
path      = require("path"),
structr   = require("structr"),
outcome   = require("outcome");

module.exports = {
	"def find": {
		"params": {
			"directory": true
		},
		"description": "runs tasks against a directory",
		"run": run
	}
};


function run(target, next) {

	var dir = target.get("directory"),
	parser  = target.parser,
	expr    = this,
	logErrors = !!target.get("logErrors");

	walkr(path.normalize(target.get("cwd") + "/" + dir)).
	filter(function(options, nextFile) {

		var childTarget = target.child({ input: options.source, file: options.source, filename: path.basename(options.source) }, false);

		return target.caller.runChild(childTarget.get("run"), childTarget, function(err, next) {
			if(err && logErrors) console.error(err);
			nextFile();
		});

	}).
	start(next);
}