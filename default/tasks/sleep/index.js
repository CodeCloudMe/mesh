module.exports = {
	"def sleep": {
		"params": {
			"time": function(target) {
				return target.value() || target.get().time;
			}
		},
		"run": run
	}
};

function run(target, next) {
	setTimeout(next, target.get().time);
}