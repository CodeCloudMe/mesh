fs             = require "fs"
path           = require "path"
step           = require "stepc"
outcome        = require "outcome"
Builders       = require "./builders"
MakeTargets    = require "./targets"
BuilderFactory = require "./factory"
Modules		   = require "./modules"


### 
 the mesh config value object

 Example config:


 {
 	

 	build: {
 		"web:debug": ["sardines"],
 		"web:release": ["web:debug", "minify"]
 	},

 	target: [
 		{
 			input: "./script.js",
 			output: "./script.out.js",
 			build: "web:*"
 		},
 		{
 			input: "./script2.js",
 			output: "./script2.out.js",
 			build: "web:*"
 		}
 	]
 }
###

module.exports = class Config


	###
	###

	constructor: () ->

		@buildFactory = new BuilderFactory @

		# the collection of available builders
		@builders    = new Builders @buildFactory

		# the collection of targets to build
		@targets     = new MakeTargets @builders


		# @modules     = new Modules()



	###
	 loads a config from disc - important because they MAY contain
	 scripts - in which case we'll need the CWD
	###

	loadFile: (file, callback) ->

		res = outcome.error callback
			
		# set the cwd to this config so scripts can be loaded in
		@cwd = path.dirname file
		
		# load from file
		step.async () ->
				fs.readFile file, "utf8", res.success @
			
			# parse the JSON

			,(configStr) ->
				try
					@ JSON.parse configStr
				catch e 	
					callback e

			# build the config

			,(config) =>
				@.load config
				callback null, @
	
	###
	 parses a mesh config
	###

	load: (config) ->

		# @modules.addDir config.directories.modules if config.directories and config.directories.modules

		# physical builders
		@builders.load(config.build) if config.build

		# next parse the targets
		@targets.load(config.targets, @cwd) if config.targets



			
		