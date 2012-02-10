mkdirp  = require "mkdirp"
ncp     = require("ncp").ncp
step    = require "stepc"
async   = require "async"
fs      = require "fs"
_       = require "underscore"
path    = require "path"
rmdirr  = require "rmdirr"
outcome = require "outcome"

###
###

readMeshConfig = (meshPath, callback) ->
	fs.readFile meshPath, "utf8", (err, content) ->
		
		config = if content then JSON.parse content else {}

		loaded = {}

		# path to mesh config
		loaded.path = meshPath

		# directory of the project
		loaded.dir  = path.dirname meshPath

		# project source
		loaded.src  = path.normalize if config.src then "#{loaded.dir}/#{config.src}" else loaded.dir

		# project library
		loaded.lib  = path.normalize if config.src then "#{loaded.dir}/#{config.lib}" else loaded.dir

		# project library
		loaded.merge  = path.normalize if config.src then "#{loaded.dir}/#{config.merge}" else loaded.dir

		# preverse the original config -- needs to be merged later on
		loaded.original = config
		
		callback null, loaded

###
###

module.exports = merge = (ops, callback) ->
	
	res        = outcome.error callback

	# the input directory where the PROJECT lives. mesh.json should be here - just like package.json
	input      = ops.input

	# the target platform we're building for
	platform  = ops.platform

	# the router for external commands
	router     = ops.router

	# the SOURCE directory from mesh.json
	sourceDir  = null

	# the OUTPUT directory from mesh.json
	outputDir  = if ops.output then "#{ops.output}/#{platform}" else null


	step.async () -> 
		readMeshConfig "#{input}/mesh.json", res.success @

	# based on the config, set the SOURCE, and the OUTPUT

	,(config) ->
		sourceDir = config.src
		outputDir = outputDir || path.normalize "#{config.merge}/#{platform}"
		@()

	# remove the output file

	,() ->
		console.log "rm #{outputDir}"
		rmdirr outputDir, @

	# first make the output dir

	,() ->
		console.log "mk #{outputDir}"
		mkdirp outputDir, 0777, res.success @


	# find the target platform first

	,() ->
		console.log "finding sources"
		router.request("target/platform/dirs").query({ platformDir: sourceDir, platforms: [platform] }).response(res.success @).pull()
	
	# next need to find the mesh files
	 
	,(dirs) -> 
		console.log "reading mesh configs"
		meshFiles = []
		meshFiles.push "#{dir}/mesh.json" for dir in dirs

		async.map meshFiles, readMeshConfig, res.success @
	
	# find the target config, and make the lib directory

	,(meshConfigs) ->

		targetConfig

		# filter through all the configs and find the platform config - it shouldn't have spaces.
		for meshConfig, i in meshConfigs
			if path.basename(meshConfig.dir) == platform
				targetConfig = meshConfig
				break


		return callback new Error("platform \"#{platform}\" does not exist for \"#{input}\"") if not targetConfig

		#it's copied over - we don't want it
		meshConfigs.splice i, 1

		# where the JS sources are copied to
		srcDir = path.normalize "#{outputDir}/#{(targetConfig.original.src || '')}"


		# make the directory - it could be something like "js" - for web
		mkdirp srcDir, 0777, res.success () => 
			ncp targetConfig.dir, outputDir, res.success () =>
				@ meshConfigs, targetConfig, srcDir


	# copy the target platforms to the output directory

	,(meshConfigs, mainConfig, srcDir) ->
		
		console.log "merging sources"
		async.forEach meshConfigs
			,(meshConfig, next) ->
				ncp meshConfig.src, srcDir, next
			, => 
			
				# do a bit of cleaning - remove the mesh file stored in the src directory (if it exists)
				fs.unlink "#{srcDir}/mesh.json"

				@ meshConfigs, mainConfig	
		
	
	
	# now merge the files together into one mesh file

	,(meshConfigs, mainConfig) ->
		console.log "merging mesh configs"

		originalConfigs = []
		originalConfigs.push config.original for config in meshConfigs
		originalConfigs.push mainConfig.original


		@ _.extend.apply(null, originalConfigs) || {}

	
	# save the mesh config
	

	,(meshConfig) ->
		console.log "writing mesh config"
		fs.writeFile "#{outputDir}/mesh.json", JSON.stringify(meshConfig, null, 2), res.success () => @ meshConfig

	# find the modules needed

	,(config) ->
		async.map config.modules || []
			,(module, next) =>
				router.request("find/module/dir").query({ module: module, dirs: ["#{input}/modules", "#{input}/node_modules"] }).response(next).pull()
			,res.success (moduleDirs) =>
				@ moduleDirs

	# filter out any modules that CANNOT be meshed

	,(moduleDirs) ->

		moduleMeshConfigPaths = []

		moduleMeshConfigPaths.push "#{dir}/mesh.json" for dir in moduleDirs


		async.filter moduleMeshConfigPaths, path.exists, @

	# recursively load the module configs

	,(meshedModuleConfigs) ->

		async.forEach meshedModuleConfigs
			,(dir, next) =>

				# merge the module together
				merge {
					input: path.dirname(meshedModuleConfigs), # the mesh.json file exists here
					platform: platform,
					router: router
				}, next


			,res.success (result) ->
				callback null, true
	