fs            = require "fs"
path          = require "path"
step          = require "stepc"
outcome       = require "outcome"
ChainBuilder  = require "./adapters/chainBuilder"
ScriptBuilder = require "./adapters/scriptBuilder"
ShellBuilder  = require "./adapters/shellBuilder"


###
 creates new builders based on configs given
###

module.exports = class Factory
	
	###
	###

	constructor: (@makeConfig) ->

		@_builderClasses = []

		# add the default builders
		@addBuilderClass ChainBuilder
		@addBuilderClass ScriptBuilder
		@addBuilderClass ShellBuilder
		
	###
	 adds a builder class - must also be a tester
	###

	addBuilderClass: (builderClass) ->

		@_builderClasses.push builderClass

	###
	 returns a new builder based on the options given. CWD is also
	 important since SOME builders may load from disc
	###

	newBuilder: (name, ops, cwd) ->

		for builderClass in @_builderClasses

			if builderClass.test ops
				
				# new builder 
				builder = new builderClass name, @makeConfig

				# load it with the options given
				builder.load ops, cwd || @makeConfig.cwd

				# return the builder
				return builder
		
		# no builder? return null
		null