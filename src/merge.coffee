EventEmitter  = require("events").EventEmitter
fs            = require "fs"
outcome       = require "outcome" 
_             = require "underscore"
ncp	          = require("ncp").ncp
mkdirp		  = require "mkdirp"

###
  merges the sources of a directory into a single directory. Format of the dir should be as such:
 
  dir/
    node web/
    node/
    common/
 
  the output would be the target platform
 ###


class DirMerger extends EventEmitter

	###
	###

	constructor: (@input, @output, @targets) ->

		@_on = outcome.error (err) => @emit "error", err

	###
	 entry point to the mesher
	###

	merge: ->
		mkdirp @output, 0777, @_on.success () => @_onOutputMade()


	###
	###

	_onOutputMade: ->
		fs.readdir @input, @_on.success (dirs) => @_onInputDirs dirs

	###
	 called when the input dir is read
	###

	_onInputDirs: (dirs) ->
		
		@_dirs = @_findIncludes dirs
		@_mergeDirs()

	###
	 with the dirs given, finds the dirs to used based on the target
	 platforms
	###

	_findIncludes: (dirs) ->
		
		includes = []

		## loop, and include any intersecting dirs
		for dir in dirs
			includes.push dir if _.intersection(@targets, dir.split " ").length
				
		includes

	###
	 recursively move the dirs to a new folder
	###

	_mergeDirs: ->
		if not @_dirs.length
 			return @emit "complete" 

 		## merge until there is nothing left
 		ncp "#{@input}/#{@_dirs.shift()}", @output, @_on.success => @_mergeDirs()




		
###
 entry point
###

module.exports = (ops, callback) ->
	
	## common is js that's usable across all platforms
	ops.include.push "common"

	dm = new DirMerger ops.input, ops.output, ops.include

	dm.on "complete", callback 
	dm.on "error", callback

	dm.merge();