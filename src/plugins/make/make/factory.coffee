fs            = require "fs"
path          = require "path"
step          = require "stepc"
outcome       = require "outcome"
ChainBuilder  = require "./adapters/chainBuilder"
ScriptBuilder = require "./adapters/scriptBuilder"
ShellBuilder  = require "./adapters/shellBuilder"
RefBuilder    = require "./adapters/refBuilder"
TargetBuilder = require "./adapters/targetBuilder"


###
 creates new builders based on configs given
###

module.exports = class Factory
	
	###
	###

	constructor: (@builders) ->

		@_builderClasses = []

		# add the default builders
		@addBuilderClass ChainBuilder
		@addBuilderClass ScriptBuilder
		@addBuilderClass ShellBuilder
		@addBuilderClass TargetBuilder
		@addBuilderClass RefBuilder
		
	###
	 adds a builder class - must also be a tester
	###

	addBuilderClass: (builderClass) ->

		@_builderClasses.push builderClass

	###
	 returns a new builder based on the options given. CWD is also
	 important since SOME builders may load from disc
	###

	newBuilder: (name, ops) ->


		for builderClass in @_builderClasses

			if builderClass.test ops
				
				# new builder 
				builder = new builderClass name, @builders

				# load it with the options given
				builder.load ops

				# return the builder
				return builder
		
		# no builder? return null
		null