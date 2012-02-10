BuilderFactory = require "./factory"
Builders       = require "./builders"
MakeTargets    = require "./targets"
Phases         = require "./phases"
step           = require "stepc"
fs             = require "fs"
path		   = require "path"


### 
 the mesh config value object
###

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

	loadFile: (file, callback) ->
			
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
				@.load config
				callback null, @
	
	###
	 parses a mesh config
	###

	load: (config) ->
		
		# physical builders
		@builders.load config.builders if config.builders

		# phases compiled of builders
		@buildPhases.load config.build if config.build

		# next parse the targets
		@targets.load config.targets if config.targets



			
		