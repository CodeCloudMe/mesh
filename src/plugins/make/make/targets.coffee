async = require "async"

###
 target for the build scripts
###

class BuildTarget

	###
	###

	constructor: (@ops, @builderSearch) ->
	###
	###

	build: (builder, next) ->
		builder.start @ops, next

### 
 chain of targets
###

module.exports = class BuildTargets

	###
	###

	constructor: (@builders) ->
		@_targets = []

	### 
	 load targets from config
	###

	load: (targets) ->

		for target in targets
			@add new BuildTarget target, target.build

	###
	###

	add: (target) ->

		@_targets.push target


	###
	###

	build: (type, callback) ->

		async.forEach @_targets,
			(target, next) =>

				# replace the build target star with the phase ~ web:* -> web:debug, web:release
				builder = @builders.find target.builderSearch.replace('*',type)

				target.build builder, next
			,callback