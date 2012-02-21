###
 base builder interface
###

exports.Builder = class

	###
	###

	constructor: (@name, @builders) ->
	
	###
	 load from raw config
	###

	load: (ops) -> # override me

	###
	 start the build phase
	###

	start: (target, callback) ->
		console.log "--> #{@_buildMessage target}"
		@_start target, callback

	###
	###

	_start: (target, callback) ->

	###
	###

	_buildMessage: (target) -> "build #{@name}"

