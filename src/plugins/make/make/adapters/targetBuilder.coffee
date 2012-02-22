async       = require "async"
BaseBuilder = require("./base").Builder
structr     = require "structr"
parseTpl    = require "../parseTpl"

###
 the ENTRY point into the build system
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

		# parse the object incase vars are passed 
		obj = parseTpl(obj, target)

		@builder.start obj, callback
	
	###
	###

	_buildMessage: (target) -> "target #{@name || target.name || ""}"

	###
	###

	_pointer: () -> ""
		




module.exports.test = (config) ->
	return !!config.task