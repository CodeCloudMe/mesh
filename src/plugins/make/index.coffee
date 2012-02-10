fs     = require "fs"
step   = require "stepc"
async  = require "async"
Config = require "./make/config"

exports.plugin = (router, params) ->
	
	makeConfigs = [ params.configPath ] 


	router.on 

		###
		 loads the mesh config
		###

		"pull make/config": (req, res, mw) ->
				
			cfg = req.sanitized.makeConfig = new Config()

			async.forEach makeConfigs,
				(file, next) ->
					cfg.loadFile file, next
				,res.success () ->
					res.end cfg if not mw.next()


		###
		###

		"pull merge -> make/config -> make": (req, res) ->

			input = req.sanitized.intermediate
			cfg   = req.sanitized.makeConfig

			# start the build phase

			# load the target mesh file
			step.async () ->
				cfg.loadFile "#{input}/mesh.json", res.success @

			# on load start building
			,(config) ->
				cfg.targets.build "debug", res.success (result) -> res.end result 


		###
		 ability for third-party modules to extend the build system
		###

		"push make/config/path": (configPath) ->

			makeConfigs.push configPath

