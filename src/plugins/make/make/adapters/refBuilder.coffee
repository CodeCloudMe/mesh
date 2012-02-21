async       = require "async"
BaseBuilder = require("./base").Builder
parseTpl    = require "../parseTpl"

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
		return parseTpl @builderName, target




module.exports.test = (config) ->
	return typeof config == "string"