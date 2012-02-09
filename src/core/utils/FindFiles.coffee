BaseOperation = require "../base/Operation"
findit		  = require("findit").find

###
 finds files based on params given
###

module.exports = class FindFiles extends BaseOperation

	###
	###

	constructor: (@dir, @match) ->
		@allFiles = []

	###
	###

	start: ->
		
		find = findit @dir
		find.on "file", @_method @_onFile

		find.on "end", () => 
			@_complete @allFiles

	###
	 called once a file is found
	###

	_onFile: (file) ->

		## make sure the file is a good match, otherwise skip
		return if not @match.test file

		@allFiles.push file


FindFiles.start = (ops, onComplete) ->
	
	new FindFiles(ops.dir, ops.tester).
	onComplete(onComplete).
	start()
		