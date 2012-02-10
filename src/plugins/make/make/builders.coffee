
###
 collection of builders loaded from configurations
###

exports.Builders = class Builders

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

			
