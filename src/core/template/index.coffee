BaseOperation = require "../base/BaseOperation"
fs            = require("fs")


###
###

class SetVars extends BaseFileOperation

	###
	###

	constructor: (@file, @data, @engine) ->


	###
	 handles the content, fills the tpl, and writes the data
	###

	start: () -> 
		fs.readfile @file, @_on.success @_onContent

	###
	###

	_onContent: (content) ->
		@engine.setVars content, @data, @_onSuccess (tplContent) => @_writeFile tplContent, @_method @_end

###
###

class Factory

	###
	###

	constructor: () ->
		
		@engines = {};

	###
	###

	addEngine: (tplEngine) ->
		@engines[tplEngine.name] = tplEngine


	###
	 tests a file to see if whether it's a template or not
	###

	test: (file) -> 
		type = @_typeFromFile file
		return if type then !!@engines[type] else false

	###
	 writes the template file data
	###

	write: (file, data, callback) ->
		new SetVars(file, data, @_engineFromFile(file)).onComplete(callback).start()

	###
	###

	_typeFromFile: (file) ->
		type = file.match(/(\w+).\w+$/)

		return if type then type[1] else null

	###
	###

	_engineFromFile: (file) -> 
		type @_typeFromTyle file
		@engines[type]
		



###
 Singleton
###

exports.factory = () -> new Factory()