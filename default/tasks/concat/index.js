var walkr = require("walkr"),
fs        = require("fs"),
seq       = require("seq");

module.exports = {
	"def concat OR public/concat": {
		"params": {
			"input": function(target) {
				if(!target.get("input")) return false;
				return target.get().input instanceof Array ? target.get().input : [target.get().input];
			},
			"output": true
		},
		"description": "combines multiple files into one",
		"message": "<%-input.join('+') %> -> <%-output %>",
		"run": run
	}
}


function run(target, nextBuilder) {

	var data = target.get();

	var include = data.target,
	output  = data.output,
	ws      = fs.createWriteStream(output, { flags: "a+" }),
	search  = new RegExp(data.filter || "\\w+\\.\\w+$"),
	buffer  = [];

	
	seq(include).
	seqEach(function(file) {
			
		var nextCat = this;

		walkr(file).
		filterFile(search, function(options, nextFile) {

			fs.readFile(options.source, "utf8", nextBuilder.success(function(content) {

				// buffer.push(content);
				ws.write(content + "\n");
				nextFile();

			}));

		}).
		start(function() {

			nextCat();

		})

	}).
	seq(function() {

		target.input = output;
		nextBuilder();
		
	});
}
