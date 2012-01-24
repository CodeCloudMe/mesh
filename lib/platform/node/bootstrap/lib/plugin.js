

module.exports = function(plugins) {
	
	plugins.params({
		'session': {
			sessionPluginsDir: __dirname + '/session_plugins/plugins'
		},
		'client.dnode': {
			port: 8080
		}
	}).
	require(__dirname + '/plugins');

}