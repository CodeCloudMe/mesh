BaseOperation = require "./Base"
_ 			  = require "underscore"
async	      = require "async"


###
 files in all the vars in a template directory
###

class SetTplVars extends BaseOperation

	###
	###

	constructor: (@files, @data, @tplVactory) ->
		super()

	###
	###

	start: ->
		async.forEach @files, @_method @_setVars, @_method @_end

	###
	###

	_setVars: (file, next) ->
		@tplFactory.write file, @data, next


exports.set = (ops, complete) -> 
	new SetTplVars(ops.files, ops.data, ops.tplFactory).
	onComplete(complete).
	start()


		