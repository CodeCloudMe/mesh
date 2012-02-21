outcome = require "outcome"
BuilderFactory = require "./factory"

###
 collection of builders loaded from configurations
###

module.exports = class Builders

	###
	###

	constructor: (@sibling) ->
		@_builders = {}
		@factory = new BuilderFactory(@)

	###
	###

	load: (builders) ->
		for builderNames of builders
			for builderName in builderNames.split(" ")
				@add @factory.newBuilder(builderName, builders[builderNames]) 

		@
			

	###
	 finds a builder based on the pattern given
	###

	find: (search) -> 
		tester = @_nameTester search

		for name of @_builders
			return @_builders[name] if tester.test name

		return @sibling.find(search) if @sibling

		throw new Error "Cannot find builder \"#{search}\""
		

	###
	###

	add: (builder) -> 
		@_builders[builder.name] = builder

	###
	###

	build: (name, target, next) ->
		@find(name).start target, next


	###
	###

	_nameTester: (search) ->
		return search if search instanceof RegExp
		return { test: search } if search instanceof Function
		return new RegExp("^#{search.replace(/\./g,"\\.").replace(/\*\*/g,".*").replace(/\*/g,"[^\\.]")}$") if typeof search == "string"

			
