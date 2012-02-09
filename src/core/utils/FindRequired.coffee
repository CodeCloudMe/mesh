BaseOperation = require "../base/Operation"
fs 			  = require "fs"
path          = require "path"
require "asyncjs"
require "beanpoll"

getPackagePath = (file) ->
	
	pathParts = path.dirname(file).split "/"

	while pathParts.length
		try
			pkgPath = "#{pathParts.join("/")}/package.json"
			fs.lstatSync pkgPath
			return pkgPath
		catch e
		
		pathParts.pop()

	return null

getPkgName  = (pkg) -> JSON.parse(fs.readFileSync(pkg, "utf8")).name
		

getPathInfo = (required, from) ->
	

	if from and required.substr(0, 1) == "." 
		return { path: require.resolve "#{path.dirname(from)}/#{required}" }

	## it's a module.
	try 

		realPath = require.resolve(required)
		pkgPath = getPackagePath(realPath)

		return { path: realPath,
		name: if pkgPath then getPkgName pkgPath else required,
		pkgPath: pkgPath,
		module: true,
		core: realPath.split('/').length == 1 }

	## something went wrong...
	catch e
		return null
			   


class RequireAnalyzer extends BaseOperation
	
	###
	###

	constructor: (@fileInfo = {}, @included = { modules: {}, paths: {} }) -> 
		super()

	###
	###

	start: () ->

		if @fileInfo.module
			fs.readFile @fileInfo.pkgPath, "utf8", @_onSuccess @_onPkgContent
		else
			fs.readFile @fileInfo.path, "utf8", @_onSuccess @_onJsContent

	###
	###

	_onJsContent: (content) ->

		
		toScan = []


		## regexp for speed.
		for required in (content.match(/require\(["'].*?["']\)/g) || [])
			
			relPath = required.match(/["'](.*?)["']/)[1]

			@_includePath toScan, relPath, @fileInfo.path

		@_loadRequired toScan

	###
	###

	_onPkgContent: (content) ->
		
		pkg = JSON.parse content

		toScan = []

		for dep of pkg.dependencies
			@_includePath toScan, "#{path.dirname(@fileInfo.pkgPath)}/node_modules/#{dep}"

		@_loadRequired toScan
	###
	###

	_includePath: (toScan, path, from) ->
		info = getPathInfo path, from
		return if not info

		pathUsed   = !!@included.paths[info.path]
		moduleUsed = !!@included.modules[info.name]

		###
		1. do NOT include core modules
		2. do NOT scan third-party modules. Third-party files are included - scanning not necessary
		###
		if not info.core and not pathUsed and not moduleUsed 
			toScan.push info 

			
		if info.name		
			@included.modules[info.name] = info
			return if moduleUsed

		@included.paths[info.path] = info

	###
	###

	_loadRequired: (required) ->
		
		return @_onRequired() if not required.length

		info = required.shift()

		new RequireAnalyzer(info, @included).onComplete(@_onSuccess () => @_loadRequired required).start()
	###
	###

	_onRequired: -> @_complete @included.paths





module.exports = class DepAnalyzer extends BaseOperation

	###
	###

	constructor: (@file) -> super()


	###
	###

	start: ->
		new RequireAnalyzer(path: @file).onComplete(@_onSuccess @_onRequired).start()

	###
	###

	_onRequired: (files) ->
		
		fixed = []
		used  = {}

		for file of files
			
			info = files[file]

			console.log info.name




new DepAnalyzer(__filename).onComplete((err, files) ->
	console.log files
).start()