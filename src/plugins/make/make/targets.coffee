seq = require "seq"

###
 target for the build scripts
###

class BuildTarget

	###
	###

	constructor: (@options, @cwd, @targets) ->


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

	load: (targets, cwd) ->
	
		for target in targets
			@add new BuildTarget target, cwd, @

	###
	###

	add: (target) ->

		@_targets.push target


	###
	###

	build: (type, callback) ->

		index = 0
		self = @

		seq(@_targets).
		seqEach (target) ->
			console.log "* target %d", ++index

			# target.build builder, next
			self.builders.build target.options.build.replace('*',type), target, => @()
		.seq () ->
			callback()
			