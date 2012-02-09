BaseOperation = require "../base/Operation"

class Queue extends BaseOperation
	
	###
	###

	constructor: (@target) ->
		super()
		@_callbacks = []

	###
	###

	add: (callback) ->
		
		if callback instanceof Array
			@add cb for cb in callback 
			return

		@_callbacks.push callback

	###
	###

	start: () -> @_next()

	###
	###

	_next: () ->
		return @_end() if not @_callbacks.length

		try
			@_callbacks.shift().call null, @target, @_onSuccess @_next
		catch e
			@_error e