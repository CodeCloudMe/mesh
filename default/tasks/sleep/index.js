module.exports = {
	"def sleep": {
		"params": {
			"time": function(target) {
				return target.value || target.data.time;
			}
		},
		"run": run
	}
};

function run(target, next) {
	setTimeout(next, target.data.time);
}