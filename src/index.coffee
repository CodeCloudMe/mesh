haba     = require "haba"
beanpoll = require "beanpoll"

exports.load = (callback) ->
	
	router       = beanpoll.router()
	pluginLoader = haba.loader()

	pluginLoader.
	options(router).
	params({
		"bootstrap": {
			"dir": __dirname + "/platform/bootstrap"
		},
		"merge": {
			"modulesDir": __dirname + "/platform/modules"	
		},
		"make": {
			"dir": __dirname + "/platform/make"
		}
	}).
	require(__dirname + "/plugins").
	load(() ->
		router.push("init")
		callback null, router if callback
	);



	