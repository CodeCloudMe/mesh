var haba = require('haba');


var pluginLoader = haba.loader();

pluginLoader.
params({
	session: {
		sessionPluginsDir: __dirname + '/session_plugins/plugins'
	}
})
require(__dirname + '/plugins').
init();