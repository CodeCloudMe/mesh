###
 base builder interface
###

exports.Builder = class

	###
	###

	constructor: (@name, @builders = null) ->
	
	###
	 load from raw config
	###

	load: (ops) -> # override me

	###
	 start the build phase
	###

	start: (target, callback) ->
			
		# only set the name if it exists - could be a reference, or chain. In
		# which case we want the PARENT chain
		if @name
			target.namespace   = @name
			target.currentTask = @name.split(":").pop()

		@_printMessage target

		@_start target, callback

	###
	###

	_start: (target, callback) ->

	###
	###

	_printMessage: (target) ->
		console.log "#{@_pointer()}#{@_buildMessage target}"
		

	###
	###

	_buildMessage: (target) -> "make #{@name}"


	###
	###

	_pointer: () -> "--> "

