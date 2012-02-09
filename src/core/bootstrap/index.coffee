BootstrapOperation = require "./Operation"


class Bootstrap

	###
	###

	constructor: (@tplFactory, @getTplVars) ->

	###
	###

	start: (ops, callback) ->
		new BootstrapOperation(ops.input, ops.output, @tplFactory, @_method @_getTplVars, ops.target).
		onComplete(callback).
		start()

	###
	###

	_getTplVars: (callback) -> if @getTplVars then @getTplVars callback else callback {}

		
module.exports = (tplFactory, getTplVars) -> new Bootstrap(tplFactory, getTplVars)