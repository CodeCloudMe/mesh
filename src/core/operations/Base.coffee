EventEmitter  = require("events").EventEmitter
outcome       = require "outcome" 


module.exports = class Operation extends EventEmitter

	###
	###

	constructor: ->

		@_on = outcome.error (err) => @_error err

	###
	 starts the operation
	###

	start: () -> # override me

	###
	 wraps around a callback for complete, and error
	###

	onComplete: (callback) ->
		
		@on "complete", (result) -> callback null, result
		@on "error", callback

		@

	###
	 wraps around a callback - only called on success
	###

	_onSuccess: (cb) -> @_on outcome.success @_method cb 

	###
	 wraps a method - makes it callable
	###

	_method: (cb) -> => cb.apply this, arguments

	###
	 called on end
	###

	_end: (err, result) -> 
		return @_error err if err
		@_complete result

	###
	###

	_complete: (result) -> @emit "complete", result

	###
	###

	_error: (err) -> @emit "error", err
		