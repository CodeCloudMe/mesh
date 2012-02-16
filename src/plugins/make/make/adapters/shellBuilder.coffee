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

		cmd = @_cmd target

		exec cmd, { cwd: target.cwd }, (err, stdout, stderr) ->
			
			console.log stdout if stdout
			console.error stderr if stderr
			callback()

	###
	###

	buildMessage: (target) -> @_cmd target


	###
	###

	_cmd: (target) -> 
		handlebars.compile(@exec)(target.options)



module.exports.test = (config) ->
	return !!config.exec