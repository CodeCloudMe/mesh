BaseOperation = require "./Base"
fs            = require("fs")


module.exports = class HandleFile extends BaseOperation

	###
	###

	constructor: (@file) ->

	###
	###

	start: ->

		fs.readFile @file, @_onSuccess @_onReadFile

	###
	###

	_onReadFile: (content) -> @_handleContent content, @_method @_end


	###
	###

	_handleContent: (content, callback) -> #override me

	###
	 additional
	###

	_writeFile: (content, callback) -> fs.writeFile @file, content, callback


