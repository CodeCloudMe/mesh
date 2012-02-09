BaseOperation = require "../base/Operation"
fs 			  = require "fs"
path          = require "path"
require "asyncjs"
require "beanpoll"

getPathInfo = (required, from) ->
	

	if required.substr(0, 1) == "." 
		return { path: require.resolve "#{path.dirname(from)}/#{required}" }

	## it's a module.
	try 
		
		return { path: require.resolve(required),
		module: true }

	## it's a CORE module
	catch e
		return { path: required
		core: true }
			   


class RequireAnalyzer extends BaseOperation
	
	###
	###

	constructor: (@file, @included = {}) -> super()

	###
	###

	start: () ->
		fs.readFile @file, "utf8", @_onSuccess @_onContent

	###
	###

	_onContent: (content) ->

		
		toScan = []


		## regexp for speed.
		for required in (content.match(/require\(["'].*?["']\)/g) || [])
			
			relPath = required.match(/["'](.*?)["']/)[1]

			info = getPathInfo relPath, @file

			###
			1. do NOT include core modules
			2. do NOT scan third-party modules. Third-party files are included - scanning not necessary
			###
			if not info.core and not info.module and not @included[info.path]	
				toScan.push info.path 


			@included[info.path] = info

		@_loadRequired toScan

	###
	###

	_loadRequired: (required) ->
		
		return @_onRequired() if not required.length


		new RequireAnalyzer(required.shift(), @included).onComplete(@_onSuccess () => @_loadRequired required).start()
	###
	###

	_onRequired: -> @_complete Object.keys @included





module.exports = class DependencyLoader extends BaseOperation

	###
	###

	constructor: (@file) -> super()


	###
	###

	start: ->
		new RequireAnalyzer(@file).onComplete(@_onSuccess @_onRequired).start()

	###
	###

	_onRequired: (files) ->
		consoel.log files


new RequireAnalyzer(__filename).onComplete((err, files) ->
	console.log files
).start()