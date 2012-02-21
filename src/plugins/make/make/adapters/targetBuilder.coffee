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

	load: (@target) ->
		@builder = @builders.factory.newBuilder null, @target.task

	###
	 passes the build phase 
	###

	_start: (target, callback) -> 
		
		obj = {}


		#structr.copy @target, target
		structr.copy target, obj
		structr.copy @target, obj

		@builder.start obj, callback
	
	###
	###

	_buildMessage: (target) -> "target #{@name || target.name || ""}"

	###
	###

	_pointer: () -> ""
		




module.exports.test = (config) ->
	return !!config.task