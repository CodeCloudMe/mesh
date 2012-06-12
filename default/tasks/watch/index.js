var watch_r = require("watch_r"),
outcome = require("outcome");

module.exports = {
	"def watch": {
		"params": {
			"file": function(target) {
				return target.data.file || target.data.input || target.data.path || process.cwd()
			},
			"run": true
		},
		"run": run
	}
};


function run(target, next) {
	var parser = target.parser,
	run = target.data.run,
	logger = target.logger;

	watch_r(target.data.file, outcome.error(next).success(function(watcher) {

		watcher.on("change", function(changed) {

			parser.run(run, target.clone().defaults({ input: changed.path }).data, function(err) {
				if(err) logger.error(err);
			})
		});

		next();
	}));
}