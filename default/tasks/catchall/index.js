var catchall = require('catchall'),
fs = require('fs'),
path = require('path')

exports.public = true;

exports.run = function(target, next) {

	catchall.load(target.input, next.success(function(wrappedSource) {

		fs.writeFile(target.output, wrappedSource, next);

	}))
}


exports.buildMessage = function(target) {

	return "catchall " + path.basename(target.input);
	
}
