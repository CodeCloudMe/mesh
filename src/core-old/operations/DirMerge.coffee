BaseOperation = require "../base/Operation"
fs            = require "fs"
_             = require "underscore"
ncp           = require("ncp").ncp
mkdirp        = require "mkdirp"

###
  merges the sources of a directory into a single directory. Format of the dir should be as such:
 
  dir/
    node web/
    node/
    common/
 
  the output would be the target platform
 ###


module.exports = class DirMerge extends BaseOperation

	###
	###

	constructor: (@input, @output, @targets) ->
		super()

	###
	###

	start: ->
		mkdirp @output, 0777, @_onSuccess @_onOutputMade()


	###
	###

	_onOutputMade: ->
		fs.readdir @input, @_onSuccess @_onInputDirs

	###
	###

	_onInputDirs: (dirs) ->
		@_dirs = DirMerge.intersection dirs
		@_mergeDirs()


	###
	###

	_mergeDirs: ->
		if not @_dirs.length
 			return @_end() 

 		## merge until there is nothing left
 		ncp "#{@input}/#{@_dirs.shift()}", @output, @_onSuccess @_mergeDirs


###
 returns the directories which intersect
 with the platforms given
###	

DirMerge.intersection = (dirs, targets) ->

	includes = []

	## loop, and include any intersecting dirs
	for dir in dirs
		includes.push dir if _.intersection(targets, dir.split " ").length
			
	includes

###
 static, shortcut method
###

DirMerge.start = (ops, callback) ->

	## common is js that's usable across all platforms
	ops.include = _.union ops.include, ["common"]

	new DirMerge(ops.input, ops.output, ops.include).
	onComplete(callback).
	start()

