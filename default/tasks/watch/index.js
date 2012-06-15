var watch_r = require("watch_r"),
outcome = require("outcome"),
_ = require("underscore");

module.exports = {
	"def watch": {
		"params": {
			"file": function(target) {
				var data = target.get();
				return data.file || data.input || data.path || process.cwd();
			},
			"run": true
		},
		"run": run
	}
};


function run(target, next) {

	var data = target.get();

	var parser = target.parser,
	run = data.run,
	delay = data.delay || 100,
	logger = target.logger;

	watch_r(data.file, outcome.error(next).success(function(watcher) {

		watcher.on("change", _.debounce(function(changed) {
			parser.run(run, target.clone().defaults({ input: changed.path }).get(), function(err) {
				if(err) logger.error(err);
			})
		}, delay));

		next();
	}));
}