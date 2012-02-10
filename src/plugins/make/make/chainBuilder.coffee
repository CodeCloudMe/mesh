BaseBuilder = require("./base").Builder
async       = require "async"


###
{
	"firefox": ["combine","compile-firefox"]
}
###

module.exports = class ChainBuilder extends BaseBuilder
	
	###
	###

	load: (@chains) ->

	###
	###

	start: (input, callback) ->
		
		async.forEach @chains,
			(chain, next) =>
				@makeConfig.builders.get(chain).start input, next
			,callback



module.exports.test = (config) ->
	return config instanceof Array
