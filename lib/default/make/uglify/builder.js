var uglify = require('uglify-js'),
parser     = uglify.parser,
outcome    = require('outcome'),
step       = require('stepc'),
fs         = require('fs'),
utils      = require('../sardines/utils'),
async      = require('async');




exports.build = function(target, next) {
	
	var on = outcome.error(next);

	step(
		function() {

			var toUglify = [], self = this;


			utils.findFiles(target.cwd + "/" + target.options.input, /\.js$/, function(file) {
				toUglify.push(file);
			}, function() {
				self(null, toUglify);
			})
		},

		on.success(function(files) {
			async.forEach(files, uglifyFile, this);
		}),
		next
	)


	function uglifyFile(file, callback) {
		
		step(
			function() {
				fs.readFile(file, "utf8", this)
			},
			on.success(function(content) {
				var body = uglify.uglify.gen_code(parser.parse(content, false, false), { beautify: target.options.beautify });
				this(null, body);
			}),
			on.success(function(body) {
				fs.writeFile(file, body, this)
			}),
			callback
		)
	}
}


exports.buildMessage = function(target) {
	return "uglifying - beautify: " + (!!target.options.beautfy)
}

