async       = require "async"
BaseBuilder = require("./base").Builder

###
 builds from a .js file
###

module.exports = class ScriptBuilder extends BaseBuilder
	
	###
	###

	load: (ops, cwd) ->

		# load the target script
		@builder = require "#{cwd}/#{ops.script}"

	###
	 passes the build phase 
	###

	start: (target, callback) -> 
		@builder.build.call this, target, callback

	###
	###

	buildMessage: (target) ->
		return if @builder.buildMessage then @builder.buildMessage target else super target



module.exports.test = (config) ->
	return !!config.script