async       = require "async"
BaseBuilder = require("./base").Builder
handlebars  = require('handlebars')

###
 builds from a .js file
###

module.exports = class RefBuilder extends BaseBuilder
	
	###
	###

	load: (@builderName) ->


	###
	 passes the build phase 
	###

	start: (target, callback) -> 
		@builders.find(@_find(target)).start target, callback


	###
	###

	_find: (target) ->
		return handlebars.compile(@builderName)(target)




module.exports.test = (config) ->
	return typeof config == "string"