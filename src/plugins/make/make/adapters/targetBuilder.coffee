async       = require "async"
BaseBuilder = require("./base").Builder
handlebars  = require "handlebars"
exec        = require("child_process").exec
structr     = require "structr"

###
 builds from a .js file
###

module.exports = class TargetBuilder extends BaseBuilder
	
	###
	###

	load: (@options) ->
		@builder = @builders.factory.newBuilder null, @options.build

	###
	 passes the build phase 
	###

	_start: (target, callback) -> 
		
		obj = {}

		structr.copy target, obj
		structr.copy @options, obj

		@builder.start obj, callback
	
	###
	###

	_buildMessage: (target) -> "target #{@name}"
		




module.exports.test = (config) ->
	return !!config.build