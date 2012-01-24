module.exports = function(ops, next) {
	
	//the explicit plugins we want to include, e.g., ['common/*','web/history','firefox/localStore']
	var plugins = ops.link.plugins, 

	//the built plugins for latte - don't want this to be copied incase latte gets updated
	builtinPluginsDir = __dirname + '/../plugins',

	//the directories we want to scan for plugins
	scanDirs = [ops.src + '/plugins', builtinPluginsDir];


}