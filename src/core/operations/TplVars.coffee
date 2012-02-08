BaseOperation = require "./Base"
_ 			  = require "underscore"
async	      = require "async"

###
 Fetches all the template vars in a bootstrap directory
###

class GetTplVars extends BaseOperation
	
	###
	###

	constructor: (@files, @tplVactory) ->
		super()
	###
	###

	start: ->
		async.concat @files, @_method @_getVars, @_onSuccess @_onTplVars
		
		
	###
	###
	
	_getTplVars: (file, next) -> 
		@tplVactory.getVars file, next
		
	###
	###
	
	_onTplVars: (vars) -> 
		@_complete _.uniq vars


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



exports.get = (ops, complete) -> 
	new GetTplVars(ops.files, ops.tplFactory).
	onComplete(complete).
	start()

exports.set = (ops, complete) -> 
	new SetTplVars(ops.files, ops.data, ops.tplFactory).
	onComplete(complete).
	start()


		