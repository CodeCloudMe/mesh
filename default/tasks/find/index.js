var walkr = require("walkr"),
outcome   = require("outcome"),
path      = require("path"),
structr   = require("structr"),
outcome   = require("outcome");

module.exports = {
	"def find": {
		"params": {
			"directory": true,
			"match": true
		},
		"run": run
	}
};


function run(target, next) {

	var dir = target.data.directory,
	match   = target.data.match,
	parser  = target.parser,
	expr    = this;

	walkr(path.normalize(target.data.cwd + "/" + dir)).
	filter(function(options, nextFile) {

		for(var cs in match) {
			if(new RegExp(cs).test(options.source)) {
				return target.caller.runChild(match[cs], structr.copy(target.data, { input: options.source }), outcome.error(next).success(function() {
					nextFile();
				}));
			}
		}

		nextFile();
	}).
	start(next);
}