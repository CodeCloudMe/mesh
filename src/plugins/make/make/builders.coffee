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

		@add @factory.newBuilder(builderName, builders[builderName]) for builderName of builders
			

	###
	 returns a builder based on the name
	###

	get: (name) -> 
		@_builders[name]

	###
	 finds a builder based on the pattern given
	###

	find: (search) -> 
		tester = @_nameTester search

		for name of @_builders
			return @_builders[name] if tester.test name

		return null
		

	###
	###

	add: (builder) -> 
		@_builders[builder.name] = builder

	###
	###

	build: (name, options, next) ->
		
		builder = @find name

		console.log "--> build %s", builder.name

		builder.start options, next


	###
	###

	_nameTester: (search) ->
		
		return search if search instanceof RegExp
		return { test: search } if search instanceof Function
		return new RegExp("^#{search.replace(/\./g,"\\.").replace(/\*\*/g,".*").replace(/\*/g,"[^\\.]")}$") if typeof search == "string"

			
