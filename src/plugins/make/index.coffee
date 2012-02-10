step   = require "stepc"
fs     = require "fs"
Config = require "./make/config"
async  = require "async"

exports.plugin = (router, params) ->
	
	makeConfigs = [ params.configPath ] 


	router.on 

		###
		###

		"pull merge -> make": (req, res) ->

			input = req.sanitized.intermediate

			cfg = new Config()

			# start the build phase

			# first load the builders
			step.async () ->
				async.forEach makeConfigs,
					(file, next) ->
						cfg.loadFile file, next
					,res.success @
				
			# load the target mesh file
			,() ->
				cfg.loadFile "#{input}/mesh.json", res.success @

			# on load start building
			,(config) ->
				cfg.targets.build "debug", res.success (result) -> res.end result 


		###
		 ability for third-party modules to extend the build system
		###

		"push make/config/path": (configPath) ->

			makeConfigs.push configPath

