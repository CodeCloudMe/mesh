fs             = require "fs"
path           = require "path"
step           = require "stepc"
outcome        = require "outcome"
Builders       = require "./builders"
traverse       = require "traverse"
BuilderFactory = require "./factory"
_              = require "underscore"
crc32          = require "crc32"

ChainBuilder  = require "./adapters/chainBuilder"
ScriptBuilder = require "./adapters/scriptBuilder"
ShellBuilder  = require "./adapters/shellBuilder"
RefBuilder    = require "./adapters/refBuilder"
TargetBuilder = require "./adapters/targetBuilder"
SearchBuilder = require "./adapters/searchBuilder"


### 
 the mesh config value object
###

module.exports = class Config


	###
	###

	constructor: () ->

		taskFactory = new BuilderFactory()
		taskFactory.addBuilderClass ChainBuilder
		taskFactory.addBuilderClass ScriptBuilder
		taskFactory.addBuilderClass ShellBuilder
		taskFactory.addBuilderClass RefBuilder
		taskFactory.addBuilderClass TargetBuilder
		taskFactory.addBuilderClass SearchBuilder

		##taskFactory  = new BuilderFactory()
		##taskFactory.addBuilderClass ChainBuilder
		##taskFactory.addBuilderClass TargetBuilder
		##taskFactory.addBuilderClass RefBuilder

		@vars = { buildId: crc32 String Date.now() }

		# the collection of available builders
		# @scripts  = new Builders scriptsFactory, @

		@tasks    = new Builders taskFactory, @



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

		config.tasks = {} if not config.tasks
		
		# move make commands over to tasks - used to separate tasks from build system depending
		# on targets
		config.tasks.make = config.make if config.make

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
	
		trav = {
			v: vars
		};

		try
			traverse(trav).forEach (v) ->
				try
					if typeof v == "string" && fs.lstatSync v
						this.update JSON.parse(fs.readFileSync(v, "utf8"))
				catch e
		catch e


		_.extend @vars, trav.v







			
		