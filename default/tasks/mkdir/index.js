var mkdirp = require("mkdirp");

module.exports = {
	"def mkdir": {
		"params": {
			"path": function(target) {
				return target.value || target.data.path;
			}
		},
		"run": run
	}
}

function run(target, next) {
	mkdirp(target.data.path, next);
}