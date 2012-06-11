var walkr = require("walkr"),
fs        = require("fs"),
seq       = require("seq");

module.exports = {
	"def concat OR public/concat": {
		"params": {
			"input": function(target) {
				if(!target.data.input) return false;
				return target.data.input instanceof Array ? target.data.input : [target.data.input];
			},
			"output": true
		},
		"message": "<%-input.join('+') %> -> <%-output %>",
		"run": run
	}
}


function run(target, nextBuilder) {

	var ops = target.data,
	include = ops.target,
	output  = ops.output,
	ws      = fs.createWriteStream(output, { flags: "a+" }),
	search  = new RegExp(ops.filter || "\\w+\\.\\w+$"),
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
