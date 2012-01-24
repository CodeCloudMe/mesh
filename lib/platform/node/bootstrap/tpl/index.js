var haba = require('haba');


var pluginLoader = haba.loader();

pluginLoader.
params({
	'session': {
		sessionPluginsDir: __dirname + '/session_plugins/plugins'
	},
	'client.dnode': {
		port: 8080
	}
}).
require(__dirname + '/plugins').
init();