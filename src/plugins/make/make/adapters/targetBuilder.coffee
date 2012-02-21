async       = require "async"
BaseBuilder = require("./base").Builder
handlebars  = require('handlebars')
exec        = require("child_process").exec

###
 builds from a .js file
###

module.exports = class ShellBuilder extends BaseBuilder
	
	###
	###

	load: (ops) ->
		@exec = ops.exec

	###
	 passes the build phase 
	###

	start: (target, callback) -> 

		

	###
	###

	buildMessage: (target) -> @_cmd target


	###
	###

	_cmd: (target) -> 
		handlebars.compile(@exec)(target.options)



module.exports.test = (config) ->
	return !!config.build