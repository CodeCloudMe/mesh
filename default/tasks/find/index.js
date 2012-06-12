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
		"run": run
	}
};


function run(target, next) {

	var dir = target.get("directory"),
	parser  = target.parser,
	expr    = this;


	walkr(path.normalize(target.get("cwd") + "/" + dir)).
	filter(function(options, nextFile) {

		var childTarget = target.child({ input: options.source, filename: path.basename(options.source) }, false);

		return target.caller.runChild(childTarget.get("run"), childTarget, function(err, next) {
			if(err) console.error(err);
			nextFile();
		});

	}).
	start(next);
}