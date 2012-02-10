async = require "async"

###
 target for the build scripts
###

class BuildTarget

	###
	###

	constructor: (@ops, @buildPhases) ->
		
	###
	###

	build: (type, callback) ->
		buildPhases.start type, @ops, callback

### 
 chain of targets
###

module.exports = class BuildTargets

	###
	###

	constructor: (@buildPhases) ->
		@_targets

	### 
	 load targets from config
	###

	load: (targets) ->

		for target in targets
			@add new BuildTarget target, @buildPhases.get target.build

	###
	###

	add: (target) ->

		@_targets.push target


	###
	###

	build: (type, callback) ->
		
		async.forEach @_targets,
			(target, next) ->
				target.build type, next
			,callback