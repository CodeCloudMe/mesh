BaseOperation = require "../base/Operation"
findit		  = require("findit").find

###
 finds files based on params given
###

module.exports = class FindFiles extends BaseOperation

	###
	###

	constructor: (@dir, @match) ->
		allFiles = []

	###
	###

	start: ->
		
		find = findit @dir
		find.on "file", @_method @_onFile

		find.on "end", () => 
			@_noMoreFiles = true

			## what if there are no files?
			@_complete @allFiles if not @_running

	###
	 called once a file is found
	###

	_onFile: (file) ->
		
		## dirty flag so we don't pre-maturely end the operation
		@_running = true

		## make sure the file is a good match, otherwise skip
		return @_checkEnd() if not @match.test file

		@allFiles.push file

		@_checkEnd()

	###
	###

	_checkEnd: () ->
		@_complete @allFiles if @_noMoreFiles


FindFiles.start = (ops, onComplete) ->
	
	new FindFiles(ops.dir, ops).
	onComplete(onComplete).
	start()
		