var mkdirp = require("mkdirp");

module.exports = {
	"def mkdir": {
		"params": {
			"path": function(target) {
				return target.value || target.get().path;
			}
		},
		"run": run
	}
}

function run(target, next) {
	mkdirp(target.get().path, next);
}