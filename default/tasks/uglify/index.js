var uglify = require('uglify-js'),
parser     = uglify.parser,
outcome    = require('outcome'),
step       = require('stepc'),
fs         = require('fs'),
utils      = require("sardines").utils,
async      = require('async'),
outcome    = require("outcome");



module.exports = {
	"def uglify OR public/uglify": {
		"params": {
			"input": true,
			"output": true
		},
		"message": "<%-input %>",
		"run": run
	}
}



function run(target, next) {

	var ops = target.data,
	on = outcome.error(next);
	
	step(
		function() {
			fs.readFile(ops.input, "utf8", this)
		},
		on.success(function(content) {
			var body = uglify.uglify.gen_code(parser.parse(content, false, false), { beautify: ops.beautify });
			this(null, body);
		}),
		on.success(function(body) {
			fs.writeFile(ops.output, body, this)
		}),
		next
	)
}


