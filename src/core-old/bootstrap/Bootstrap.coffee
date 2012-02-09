BaseOperation  = require "../base/Operation"
FindFiles      = require "../utils/FindFiles"
TplVars        = require "./TplVars"
ncp	           = require("ncp").ncp
mkdirp		   = require "mkdirp"


###
steps:

1. merge the target bootstrap platforms into an intermediate file
2. find the template variables in the bootstrap files
3. run the template variables through a factory, whether interactive, or otherwise...
4. fill the template vars

###


module.exports = class Bootstrap extends BaseOperation

	###
	 Constructor
	 @param input the input directory which contains the bootstrap code
	 @param output the output directory for out bootstrap code
	 @param tplFactory the template factory for finding variables
	 @param walkTplVars the function which walks through the template vars and gives us 
	 stuff to data in our templates
	 @param include the platforms we want to include ~ node, web, node+web
	###

	constructor: (@input, @output, @tplFactory, @getTplData) ->
		super()

	###
	###

	start: ->
		mkdirp @output, 0777, @_onSuccess @_onOutputMade

	###
	###

	_onOutputMade: ->
		ncp @input, @output, @_onSuccess @_onDirCopied

	###
	###

	_onDirCopied: ->

		FindFiles.start 
			dir: @output
			tester: @tplFactory,
			@_onSuccess @_onTplFiles

	###
	###

	_onTplFiles: (files) ->

		@_tplFiles = files

		@getTplData @_onSuccess @_onTplData

	###
	###

	_onTplData: (data) ->

		TplVars.set
			files: @_tplFiles
			tplFactory: @tplFactory
			data: data,
			@_onSuccess @_onWriteTplData

	###
	###

	_onWriteTplData: () ->

		@_end()


