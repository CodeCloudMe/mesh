seq			= require "seq"
BaseBuilder = require("./base").Builder
outcome     = require "outcome"


###
 a chain of builders

 Example:

 "firefox":["combine","compile-firefox"]
###

module.exports = class ChainBuilder extends BaseBuilder
	
	###
	###

	load: (chains) ->
		
		@chains = []
		for builder in chains
			@chains.push @builders.factory.newBuilder(null, builder)
		
				
	###
	###

	_start: (target, callback) ->

		self = @


		seq(@chains).
		seqEach( (chain, next) ->
			chain.start target, outcome.error(this).success(this)
		).seq ->
			callback()
	


module.exports.test = (config) ->
	return config instanceof Array
