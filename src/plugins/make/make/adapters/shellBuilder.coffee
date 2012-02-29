async       = require "async"
BaseBuilder = require("./base").Builder
parseTpl    = require "../parseTpl"
exec        = require("child_process").exec

###
 executes a shell script
###

module.exports = class ShellBuilder extends BaseBuilder
	
	###
	###

	load: (ops) ->
		@exec = ops.exec

	###
	 passes the build phase 
	###

	_start: (target, callback) -> 

		cmd = @_cmd target

		exec cmd, { cwd: target.cwd }, (err, stdout, stderr) ->
			
			console.log stdout if stdout
			console.error stderr if stderr
			callback()

	###
	###

	_buildMessage: (target) -> @_cmd target

	###
	###

	_cmd: (target) -> 	
		return parseTpl @exec, target



module.exports.test = (config) ->
	return !!config.exec