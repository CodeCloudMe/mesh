BuilderFactory = require "./factory"
Builders       = require "./builders"
MakeTargets    = require "./targets"
Phases         = require "./phases"
step           = require "stepc"
fs             = require "fs"
path		   = require "path"



module.exports = class Config


	###
	###

	constructor: () ->

		@buildFactory = new BuilderFactory @

		# the collection of available builders
		@builders    = new Builders @buildFactory

		# phases for targets such as debug, and release
		@buildPhases = new Phases @buildFactory

		# the collection of targets to build
		@targets     = new MakeTargets @buildPhases

		@_targets = []

	###
	 loads a config from disc - important because they MAY contain
	 scripts - in which case we'll need the CWD
	###

	load: (file, callback) ->
			
		# set the cwd to this config so scripts can be loaded in
		@cwd = path.dirname file
		
		# load from file
		step.async () ->
				fs.readFile file, "utf8", res.success @
			
			# parse the JSON

			,(configStr) ->
				@ JSON.parse configStr

			# build the config

			,(config) =>
				@.parse config
				callback null, @
	###
	###

	parse: (config) ->
		
		@builders.parse config.builders if config.builders

		# phases first
		@buildPhases.parse config.build if config.build

		# next parse the targets
		@targets.parse config.targets if config.targets



			
		