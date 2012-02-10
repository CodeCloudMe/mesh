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
		"make": {
			"dir": __dirname + "/platform/make"
		}
	}).
	require(__dirname + "/plugins").
	load(() ->
		callback null, router if callback
	);



	