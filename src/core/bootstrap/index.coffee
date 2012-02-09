BootstrapOperation = require "./Bootstrap"
fs = require "fs"

class Bootstrap

	###
	###

	constructor: (@bootstrapDir, @tplFactory, @getTplVars) ->

	###
	###

	start: (ops, callback) ->
		new BootstrapOperation(@bootstrapDir, ops.output, @tplFactory, ((cb) => @_getTplVars(cb)), ops.target).
		onComplete(callback).
		start()

	###
	###

	_getTplVars: (callback) -> if @getTplVars then @getTplVars callback else callback {}




		
module.exports = (tplFactory, getTplVars) -> 
	return new Bootstrap(tplFactory, getTplVars)