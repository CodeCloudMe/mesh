var walkr = require("walkr"),
fs        = require("fs"),
seq       = require("seq");

exports.public = true;

exports.run = function(target, nextBuilder) {


	var ops = target,
	include = getInput(target),
	output = target.output,
	ws      = fs.createWriteStream(target.output, { flags: "a+" }),
	search  = new RegExp(target.search || "\\w+\\.\\w+$"),
	buffer = [];


	
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

		// fs.writeFile(output, buffer.join("\n"), nextBuilder);
		target.input = output;
		nextBuilder();
		
	});
}

exports.taskMessage = function(target) {
	return "concat " + getInput(target).join(" + ") + " -> " + target.output;
}


function getInput(target) {
	return target.input instanceof Array ? target.input : [target.input];
}