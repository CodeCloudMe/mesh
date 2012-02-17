var catchall = require('catchall'),
fs = require('fs');


exports.build = function(target, next) {

	catchall.load(target.cwd + "/" + target.options.entry, next.success(function(wrappedSource) {

		fs.writeFile(target.cwd + "/" + target.options.entry, wrappedSource, next);

	}))
}


exports.buildMessage = function(target) {

	return "catchall " + target.options.entry;
	
}
