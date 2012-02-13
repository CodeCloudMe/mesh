async = require "async"
path  = require "path"

module.exports = class Modules 
	
	constructor: () ->
		@dirs = []

	###
	###

	addDir: (dir) -> 
		if dir instanceof Array
			@dirs = @dirs.concat dir
		else
			@dirs.push dir

	###
	###

	find: (name, directories, callback) ->	

		if directories instanceof Function
			callback = directories
			directories = []


		async.filter directories.concat @dirs, path.exists, (dirs) ->
			return calllback new Error("module #{name} does not exist") if not dirs.length
			callback null, dirs.shift()
			
		