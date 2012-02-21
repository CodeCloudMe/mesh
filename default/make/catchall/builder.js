var catchall = require('catchall'),
fs = require('fs');


exports.build = function(target, next) {

	catchall.load(target.entry, next.success(function(wrappedSource) {

		fs.writeFile(target.entry, wrappedSource, next);

	}))
}


exports.buildMessage = function(target) {

	return "catchall " + target.options.entry;
	
}
