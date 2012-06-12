exec = require("child_process").exec;

module.exports = {
	"def exec": {
		"params": {
			"script": function(target) {
				return target.value() || target.get().script;
			}
		},
		"message": "<%-script %>",
		"run": run
	}
}

function run(target, next) {
	var data = target.get();

	var script = data.script;

	var child = exec(script, { cwd: data.cwd, maxBuffer: 0 }, next),
	logger = target.logger;

	//taking a look at the sauce code, stdout appended to an array.
	//We don't want that shit, so remove the listeners. This also fixes
	//the thrown exception for long processes
	child.stdout.removeAllListeners("data");
	child.stderr.removeAllListeners("data");

	child.stdout.on("data", function(chunk) {
		String(chunk).split("\n").forEach(function(msg) {
			logger.info(msg);
		});
	});

	child.stderr.on("data", function(chunk) {
		String(chunk).split("\n").forEach(function(msg) {
			logger.error(msg);
		});
	});
}