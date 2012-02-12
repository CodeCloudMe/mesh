var resolve = require("resolve");

module.exports = function(target, next) {
	console.log(target.cwd);

	resolve.sync('plugin.dnode', {
		basedir: target.cwd
	});

}