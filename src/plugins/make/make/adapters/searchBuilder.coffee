async       = require "async"
BaseBuilder = require("./base").Builder
handlebars  = require "handlebars"
walkr       = require "walkr"
structr     = require "structr"
outcome     = require "outcome"

###
 the ENTRY point into the build system
###

module.exports = class SearchBuilder extends BaseBuilder
	
	###
	###

	load: (options) ->
	
		@dir = options.walkDirectory

		builders = @findBuilders = []

		for search of options.find
			builders.push({
				search: new RegExp(search),
				builder: @builders.factory.newBuilder(search, options.find[search])
			})

	###
	 passes the build phase 
	###

	_start: (target, callback) -> 
		
		walkr(@dir).
		filter (options, next) =>
			
			for filt in @findBuilders
				if filt.search.test(options.source)
					return filt.builder.start structr.copy(target, { file: options.source }), callback.success () ->
							next()

			next()

		.start callback
			
	###
	###

	_printMessage: ->
		




module.exports.test = (config) ->
	return !!config.walkDirectory