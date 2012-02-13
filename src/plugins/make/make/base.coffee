###
 base builder interface
###

exports.Builder = class

	###
	###

	constructor: (@name, @makeConfig) ->
	
	###
	 load from raw config
	###

	load: (ops) -> # override me

	###
	 start the build phase
	###

	start: (input, callback) ->