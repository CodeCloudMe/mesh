dirmr = require("dirmr");

module.exports = {
	"def copy": {
		"params": {
			"input": function(target) {
				if(!target.data.input) return false;
				return target.data.input instanceof Array ? target.data.input : [target.data.input];
			}
		},
		"message": "<%-input.join(', ') %> -> <%-output %>",
		"run": run
	}
}


function run(target, next) {

	var ops = target.data;
	var include = ops.input,
	exclude     = (ops.exclude || []).map(function(filter) {
		return new RegExp("^" + filter + "$");
	});


	dirmr(include).
	filter(function(options, next) {
		for(var i = exclude.length; i--;) {
			if(exclude[i].test(options.name)) return next(false);
		}

		next();
	}).
	join(ops.output).
	complete(next);
}
