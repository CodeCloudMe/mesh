dirmr = require("dirmr");

module.exports = {
	"def copy": {
		"params": {
			"input": function(target) {
				if(!target.get("input")) return false;
				return target.get().input instanceof Array ? target.get().input : [target.get().input];
			}
		},
		"description": "copies files to a new location",
		"message": "<%-input.join(', ') %> -> <%-output %>",
		"run": run
	}
}


function run(target, next) {

	var data = target.get();

	var include = data.input,
	exclude     = (data.exclude || []).map(function(filter) {
		return new RegExp("^" + filter + "$");
	});


	dirmr(include).
	filter(function(options, next) {
		for(var i = exclude.length; i--;) {
			if(exclude[i].test(options.name)) return next(false);
		}

		next();
	}).
	join(data.output).
	complete(next);
}
