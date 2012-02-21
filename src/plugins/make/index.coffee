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
			
			# directory to the intermediate files
			input = req.sanitized.intermediate

			# the physical config object
			cfg   = req.sanitized.makeConfig

			# phase of the builder we want to execute: debug, release, etc.
			target = req.query.target

			# load the target mesh file
			step.async () ->
				cfg.loadFile "#{input}/mesh.json", => @ cfg

			# on load start building
			,(config) ->
				
				cfg.tasks.build target, { target: target }, res.success (result) -> res.end result

			,(err) ->
				res.error err
				


		###
		 ability for third-party modules to extend the build system
		###

		"push make/config/path": (configPath) ->
			makeConfigs.push configPath

