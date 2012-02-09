BootstrapOperation = require "./Bootstrap"
fs = require "fs"

class Bootstrap

	###
	###

	constructor: (@bootstrapDir, @tplFactory, @tplData) ->

	###
	###

	start: (ops, callback) ->
		new BootstrapOperation(@bootstrapDir, ops.output, @tplFactory, ((cb) => @_getTplVars(cb)), ops.target).
		onComplete(callback).
		start()

	###
	###

	_getTplVars: (callback) -> callback null, @tplData || {}




		
module.exports = (bootstrapDir, tplFactory, tplData) -> 
	return new Bootstrap(bootstrapDir, tplFactory, tplData)