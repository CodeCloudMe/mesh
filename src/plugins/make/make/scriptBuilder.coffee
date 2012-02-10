BaseBuilder = require("./base").Builder
async       = require "async"

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

	start: (input, callback) -> 
		@builder.call this, input, callback



module.exports.test = (config) ->
	return !!config.script