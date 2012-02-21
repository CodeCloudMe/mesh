fs             = require "fs"
path           = require "path"
step           = require "stepc"
outcome        = require "outcome"
Builders       = require "./builders"
traverse       = require "traverse"
BuilderFactory = require "./factory"
_              = require "underscore"

ChainBuilder  = require "./adapters/chainBuilder"
ScriptBuilder = require "./adapters/scriptBuilder"
ShellBuilder  = require "./adapters/shellBuilder"
RefBuilder    = require "./adapters/refBuilder"
TargetBuilder = require "./adapters/targetBuilder"


### 
 the mesh config value object
###

module.exports = class Config


	###
	###

	constructor: () ->

		buildFactory = new BuilderFactory()
		buildFactory.addBuilderClass ChainBuilder
		buildFactory.addBuilderClass ScriptBuilder
		buildFactory.addBuilderClass ShellBuilder
		buildFactory.addBuilderClass RefBuilder

		taskFactory  = new BuilderFactory()
		taskFactory.addBuilderClass ChainBuilder
		taskFactory.addBuilderClass TargetBuilder
		taskFactory.addBuilderClass RefBuilder

		@vars = {}

		# the collection of available builders
		@builders    = new Builders buildFactory, @

		@tasks       = new Builders taskFactory, @builders, @



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

		@_loadVars config.vars if config.vars



	###
	###

	_fixConfig: (config) ->

		for key of config
			value = config[config]


	###
	###

	_loadVars: (vars) ->
		
		vars = JSON.parse(fs.readFileSync(vars, "utf8")) if typeof vars == "string"

		_.extend @vars, vars







			
		