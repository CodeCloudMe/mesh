fs             = require "fs"
path           = require "path"
step           = require "stepc"
outcome        = require "outcome"
Builders       = require "./builders"
traverse       = require "traverse"


### 
 the mesh config value object
###

module.exports = class Config


	###
	###

	constructor: () ->


		# the collection of available builders
		@builders    = new Builders

		@tasks       = new Builders @builders



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
		
		self = @

		# fix relative paths
		traverse(config).forEach (v) ->
			if typeof v == 'string' && /^(\.|~)+(\/\w*)+/.test v
				this.update path.normalize v.replace(/^\./, self.cwd + "/.").replace(/^~/, process.env.HOME + "/");

			
		# physical builders
		@builders.load(config.build) if config.build

		@tasks.load(config.tasks) if config.tasks



	###
	###

	_fixConfig: (config) ->

		for key of config
			value = config[config]




			
		