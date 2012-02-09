haba = require "haba"

exports.load = () ->

	pluginLoader = haba.loader()

	pluginLoader.
	params({
		"cmd.bootstrap": {
			"dir": __dirname + "/platform/bootstrap"
		},
		"cmd.make": {
			"dir": __dirname + "/platform/make"
		}
	}).
	require(__dirname + "/plugins").
	load();




exports.load()


	