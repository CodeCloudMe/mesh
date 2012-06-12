module.exports = {
	"def install": {
		"params": {
			"package": function(target) {
				return target.value || target.data["package"];
			}
		},
		"run": run
	}
};

function run(target, next) {
	var pkg = target.data["package"];
	console.log("TODO")
	next();
}