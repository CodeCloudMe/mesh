BaseOperation = require "../base/Operation"
fs 			  = require "fs"
path          = require "path"
FindFiles	  = require "../utils/FindFiles"


###
 returns the package path
###

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

###
 returns the package name
###

getPkgName  = (pkg) -> JSON.parse(fs.readFileSync(pkg, "utf8")).name
		
###
 returns info about the given path ~ module? core? etc.
###

getPathInfo = (required, from) ->
	

	if from and required.substr(0, 1) == "." 
		return { path: require.resolve "#{path.dirname(from)}/#{required}" }

	## it's a module.
	try 

		realPath = require.resolve(required)
		pkgPath  = getPackagePath(realPath)
		name     = if pkgPath then getPkgName pkgPath else required

		return { path: realPath,
		name: name,
		pkgPath: pkgPath,
		module: true,
		core: realPath.split('/').length == 1 }

	## something went wrong...
	catch e
		return null
		

###
 scans a module's package for dependencies
###

class ModuleAnalyzer extends BaseOperation

	###
	###

	constructor: (@fileInfo) -> super()

	###
	###

	start: ->
		fs.readFile @fileInfo.pkgPath, "utf8", @_onSuccess @_onPkgContent


	###
	###

	_onPkgContent: (content) ->
		
		pkg = JSON.parse content

		toScan = []

		for dep of pkg.dependencies
			toScan.push getPathInfo "#{path.dirname(@fileInfo.pkgPath)}/node_modules/#{dep}"

		new ModulesAnalyzer(toScan).onComplete(@_method @_end).start()


###
 scans a collection of modules
###

class ModulesAnalyzer extends BaseOperation

	###
	###

	constructor: (@modules) -> super()


	###
	###

	start: -> 
		@_loadedModules = @modules.concat()
		@_loadModules @_loadingModules = @modules.concat()

	###
	###

	_loadModules: (modules) ->
		return @_complete @_loadedModules if not modules.length 
		new ModuleAnalyzer(modules.shift()).onComplete(@_onSuccess @_onRequired).start()

	###
	###

	_onRequired: (modules) ->
		@_loadedModules = @_loadedModules.concat modules
		@_loadModules @_loadingModules

###
 
###

class ReqAnalyzer extends BaseOperation
	
	###
	###

	constructor: (@file) -> super()

	###
	###

	start: ->
		fs.readFile @file, "utf8", @_onSuccess @_onJsContent


	###
	###

	_onJsContent: (content) ->

		toScan = []


		## regexp for speed.
		for required in (content.match(/require\(["'].*?["']\)/g) || [])
			
			relPath = required.match(/["'](.*?)["']/)[1]

			info = getPathInfo relPath, @file

			toScan.push info if info.module and not info.core

		
		new ModulesAnalyzer(toScan).onComplete(@_method @_end).start()



###
###

module.exports = class ProjAnalyzer extends BaseOperation

	###
	###

	constructor: (@dir) -> super()


	###
	###

	start: ->
		@_modules = []
		FindFiles.start { dir: @dir, tester: /js$/ }, @_onSuccess @_scanFiles

	###
	###

	_scanFiles: (files) ->
		@_toScan = files
		return @_onScannedFiles() if not files.length
		
		new ReqAnalyzer(files.shift()).onComplete(@_onSuccess @_onDependencies).start()



	###
	###

	_onDependencies: (modules) ->
		@_modules = @_modules.concat modules
		@_scanFiles @_toScan
	
	###
	###

	_onScannedFiles: () ->
		usable = []
		used   = {}

		# skip already used
		for module in @_modules
			continue if used[module.name]
			used[module.name] = true
			usable.push module
		
		@_complete usable


exports.scan = (dir, callback) ->
	new ProjAnalyzer(dir).onComplete(callback).start()


