async = require "async"


class BuildPhase

	###
	###

	constructor: (@name) ->

		@_builders = {}

	###
	###

	add: (type, builder) ->

		@_builders[type] = builder

	###
	###

	start: (type, ops, next) -> @_builders[type].start ops, next


###
###

module.exports = class BuildPhases

	###
	###

	constructor: (@factory) ->

		@_phases = {}

	###
	###

	parse: (ops) ->

		@add phase.name, phase for phase of phases

		
	###
	###

	add: (name, phase) ->
			
		@_phases[name] = _newBuildPhase name, phase

	###
	###

	get: (ops) ->
		
		return @_phases[ops] if typeof ops == "string"

		@_newBuilder null, ops

	###
	###

	_newBuildPhase: (name, builders) ->

		ph = new BuildPhase name

		ph.add builderName, _newBuilder builders[builderName] for builderName of builders

		ph

	###
	###

	_newBuilder: (name, ops) -> 

		@factory.newBuilder name, ops


		
