beanpoll = require "beanpoll"


exports.plugin = () ->

	router = beanpoll.router()

	init: () =>

		## plugin the routers for the build phases
		for plugin in @plugins(/.*/)	
			plugin.routes router, @params plugin.name if plugin.routes		


		
		router.
		request("bootstrap").
		query({ output: '/Users/craig/Desktop/test', platforms: ['node','web'] }).
		error((err) ->
			console.log err
		).
		pull();