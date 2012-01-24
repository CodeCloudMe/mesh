var haba = require('haba');

exports.load = function() {

	var pluginLoader = haba.loader();

	pluginLoader.
	require(__dirname + '/plugins').
	init();	
	
}
