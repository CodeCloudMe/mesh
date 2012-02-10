ChainBuilder  = require "./chainBuilder"
ScriptBuilder = require "./scriptBuilder"
step           = require "stepc"
fs             = require "fs"
outcome        = require "outcome"
path           = require "path"


###
 creates new builders based on configs given
###

module.exports = class Factory
	
	###
	###

	constructor: (@makeConfig) ->

		@_builderClasses = []

		# add the default builders
		@addBuilderClass ChainBuildrer
		@addBuilderClass ScriptBuilder
		
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
			builder = new builderClass name, @makeConfig if builderClass.test name
			builder.load ops, cwd || @makeConfig.cwd
			return builder
