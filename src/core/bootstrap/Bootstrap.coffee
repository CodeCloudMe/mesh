BaseOperation  = require "../base/Operation"
DirMerge       = require "../merge/DirMerge"
FindFiles      = require "../utils/FindFiles"
TplVars        = require "./TplVars"
ncp	           = require "ncp"


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

	constructor: (@input, @output, @tplFactory, @getTplData, @include) ->
		super()

	###
	###

	start: ->

		## first need to merge the bootstrap files into the
		## intermediate directory
		DirMerge.start 
			input: @input
			output: @output
			include: @include,
			@_onSuccess @_onDirMerge

	###
	###

	_onDirMerge: ->

		FindFiles.start 
			dir: @intermDir
			test: @tplFactory.test,
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


