fs            = require "fs"
path          = require "path"
step          = require "stepc"
outcome       = require "outcome"


###
 creates new builders based on configs given
###

module.exports = class Factory
	
	###
	###

	constructor: () ->

		@_builderClasses = []
		
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