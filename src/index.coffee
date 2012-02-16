beanie = require "beanie"

exports.load = (callback) ->
	
	loader = beanie.loader()

	loader.
	params({
		"bootstrap": {
			"dir": __dirname + "/../default/bootstrap"
		},
		"merge": {
			"modulesDir": __dirname + "/../default/modules"	
		},
		"make": {
			"configPath": __dirname + "/../default/mesh.json"
		}
	}).
	require(__dirname + "/plugins").
	load(() ->
		loader.router.push("init")
		callback null, loader.router if callback
	);



	