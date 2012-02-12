seq			= require "seq"
BaseBuilder = require("./base").Builder


###
 a chain of builders

 Example:

 "firefox":["combine","compile-firefox"]
###

module.exports = class ChainBuilder extends BaseBuilder
	
	###
	###

	load: (@chains) ->
					
	###
	###

	start: (input, callback) ->

		self = @

		seq(@chains).
		seqEach( (chain, next) ->
			self.makeConfig.builders.build chain, input, this
		).seq(callback)
	


module.exports.test = (config) ->
	return config instanceof Array
