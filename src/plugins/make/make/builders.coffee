###
 collection of builders loaded from configurations
###

module.exports = class Builders

	###
	###

	constructor: (@factory) ->
		@_builders = {}

	###
	###

	load: (builders) ->
		
		@add builderName, @factory.newBuilder(builderName, builders[builderName]) for builderName of builders
			

	###
	###

	get: (name) -> @_builders[name]

	###
	###

	add: (builder) -> @_builders[builder.name] = builder

			
