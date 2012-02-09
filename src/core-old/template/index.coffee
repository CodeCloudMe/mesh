BaseOperation = require "../base/Operation"
fs            = require("fs")


###
###

class SetVars extends BaseOperation

	###
	###

	constructor: (@file, @data, @engine) -> super()


	###
	 handles the content, fills the tpl, and writes the data
	###

	start: () -> 
		fs.readFile @file, "utf8", @_onSuccess @_onContent

	###
	###

	_onContent: (content) ->
		@engine.setVars content, @data, @_onSuccess @_writeFile


	###
	 write the template file to a new file without the tpl ext
	###

	_writeFile: (content) ->
		fs.writeFile @file.replace('.' + @engine.name,''), content, @_onSuccess @_onWriteFile

	###
	 remove the template file
	###

	_onWriteFile: () ->
		fs.unlink @file, @_method @_end


###
###

class Factory

	###
	###

	constructor: () ->
		
		@engines = {};

		@addEngine require "./engines/mustache"

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
		type = @_typeFromFile file
		@engines[type]
		



###
 Singleton
###

exports.factory = () -> new Factory()