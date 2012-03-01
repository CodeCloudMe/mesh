fs     = require "fs"
step   = require "stepc"
async  = require "async"
capirona = require "capirona"

exports.plugin = (router, params) ->

	makeConfigs = [ params.configPath ] 


	router.on 

		###
		 loads the mesh config
		###

		"pull make/config": (req, res, mw) ->

			cfg = req.sanitized.makeConfig = capirona.make()

			for config in makeConfigs
				cfg.load config

			cfg.next () ->
				res.end cfg if not mw.next()
				@()

		###
		###

		"pull merge -> make/config -> make": (req, res) ->

			# directory to the intermediate files
			input = req.query.input

			# the physical config object
			cfg   = req.sanitized.makeConfig

			# phase of the builder we want to execute: debug, release, etc.
			task = req.query.task

			pkg = JSON.parse(fs.readFileSync("#{req.sanitized.intermediate}/package.json", "utf8"));



			# load the target mesh file
			step.async () ->
				cfg.load "#{input}/make.json", => @ cfg

			# on load start building
			,(config) ->
				cfg.run task, { 
					cwd: req.sanitized.intermediate,
					target: task, 
					directories: {
						root:  "#{req.sanitized.intermediate}",
						src: "#{req.sanitized.intermediate}/#{pkg.directories['mesh-src']}", 
						lib: "#{req.sanitized.intermediate}/#{pkg.directories.lib||'lib'}" 
					}
				}, res.success (result) -> res.end result

			,(err) ->
				res.error err



		###
		 ability for third-party modules to extend the build system
		###

		"push make/config/path": (configPath) ->
			makeConfigs.push configPath