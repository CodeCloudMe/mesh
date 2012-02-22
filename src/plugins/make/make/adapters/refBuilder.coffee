async       = require "async"
BaseBuilder = require("./base").Builder
parseTpl    = require "../parseTpl"

###
 references another builder
###

module.exports = class RefBuilder extends BaseBuilder
	
	###
	###

	load: (@builderName) ->


	###
	 passes the build phase 
	###

	_start: (target, callback) -> 
		@builders.find(@_find(target)).start target, callback

	###
	###
	_printMessage: () ->
	
	###
	###

	_find: (target) ->
		return parseTpl @builderName, target




module.exports.test = (config) ->
	return typeof config == "string"