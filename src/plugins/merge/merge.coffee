_       = require "underscore"
fs      = require "fs"
ncp     = require("ncp").ncp
step    = require "stepc"
path    = require "path"
async   = require "async"
mkdirp  = require "mkdirp"
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

		loaded.merge = path.normalize "#{loaded.dir}/#{(config.merge || '')}"

		# preverse the original config -- needs to be merged later on
		loaded.original = config
		
		callback null, loaded

###
###

readPackageConfig = (pkg, callback) ->
	fs.readFile pkg, "utf8", (err, content) ->
		return callback null, {} if err
		config = if content then JSON.parse content else {}

		dir = path.dirname pkg

		dirs = config.directories

		dirs.src     = path.normalize "#{dir}/#{(dirs.src || '')}"
		dirs.lib     = path.normalize "#{dir}/#{(dirs.lib || 'lib')}"
		dirs.interm  = path.normalize "#{dir}/#{(dirs.interm || 'intermediate')}"

		callback null, config
		

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
	outputDir  = ops.output

	platformDirs = null

	incModules = null



	step.async () -> 
		readPackageConfig "#{input}/package.json", res.success @

	# based on the config, set the SOURCE, and the OUTPUT

	,(config) ->
		sourceDir = config.directories.src
		outputDir = outputDir || path.normalize "#{config.directories.interm}/#{platform}"

		@()

	# remove the output file

	,() ->
		rmdirr outputDir, @

	# first make the output dir

	,() ->
		mkdirp outputDir, 0777, res.success @


	# find the target platform first

	,() ->
		router.request("target/platform/dirs").query({ platformDir: sourceDir, platforms: [platform] }).response(res.success @).pull()


	# next need to find the mesh files
	 
	,(dirs) -> 
		platformDirs = dirs
		meshFiles = []
		meshFiles.push "#{dir}/mesh.json" for dir in dirs

		async.map meshFiles, readMeshConfig, res.success @
	
	# find the target config, and make the lib directory

	,(meshConfigs) ->

		

		# filter through all the configs and find the platform config - it shouldn't have spaces.
		for meshConfig, i in meshConfigs
			if path.basename(meshConfig.dir) == platform
				targetConfig = meshConfig
				break


		return callback new Error("platform \"#{platform}\" does not exist for \"#{input}\"") if not targetConfig

		#it's copied over - we don't want it
		meshConfigs.splice i, 1


		# where the JS sources are copied to
		srcDir = path.normalize "#{outputDir}/#{(targetConfig.original.merge || '')}"


		# make the directory - it could be something like "js" - for web
		mkdirp srcDir, 0777, res.success () => 
			ncp targetConfig.dir, outputDir, res.success () =>
				@ meshConfigs, targetConfig, srcDir


	# copy the target platforms to the output directory

	,(meshConfigs, mainConfig, srcDir) ->
		
		async.forEach meshConfigs
			,(meshConfig, next) ->
				ncp meshConfig.merge, srcDir, next
			, => 

				# do a bit of cleaning - remove the mesh file stored in the src directory (if it exists)
				# fs.unlink "#{srcDir}/mesh.json"

				@ meshConfigs, mainConfig	
		
	
	
	# now merge the files together into one mesh file

	,(meshConfigs, mainConfig) ->

		originalConfigs = []
		originalConfigs.push config.original for config in meshConfigs
		originalConfigs.push mainConfig.original


		@ _.extend.apply(null, originalConfigs) || {}

	
	# save the mesh config
	

	,(config) ->

		incModules = (config.modules || []).concat()

		# combine the make modules
		if config.targets
			for target in config.targets 
				incModules = modules.concat target.modules || []


		fs.writeFile "#{outputDir}/mesh.json", JSON.stringify(config, null, 2), res.success @

		
	# next merge the packages

	,() ->


		pkgFiles = ["#{input}/package.json"]
		pkgFiles.push "#{dir}/package.json" for dir in platformDirs
		async.map pkgFiles, readPackageConfig, res.success @

	# write the package
	,(pkgs) ->

		pkg = _.extend.apply null, pkgs

		incModules = incModules.concat Object.keys(pkg.dependencies || {})
		incModules = _.uniq incModules
		
		fs.writeFile "#{outputDir}/package.json", JSON.stringify(pkg, null, 2), res.success @

	# check to make sure the modules exist

	,() ->

		async.map incModules
			,(module, next) =>
				router.request("find/module/dir").query({ module: module, dirs: ["#{input}/modules", "#{input}/node_modules"] }).response(next).pull()
			,res.success (moduleDirs) =>
				@ moduleDirs

	# copy modules over to node_modules dir

	,(moduleDirs) ->

		async.map moduleDirs
			, (dir, next) =>
				od = "#{input}/node_modules/#{path.basename dir}"
				mkdirp od, 0777, =>
					ncp dir, od, => next null, od
			, res.success (newDirs) =>
				@ newDirs

	# filter out any modules that CANNOT be meshed
	, (moduleDirs) ->

		pkgPaths = []


		pkgPaths.push "#{dir}/package.json" for dir in moduleDirs


		async.filter pkgPaths, path.exists, @


	# recursively load the module configs

	,(pkgPaths) ->

		async.forEach pkgPaths
			,(pkgPath, next) =>

				modInput = path.dirname(pkgPath);

				# merge the module together
				merge {
					input: modInput, # the mesh.json file exists here
					output: "#{outputDir}/node_modules/#{path.basename(modInput)}"
					platform: platform,
					router: router
				}, next


			,res.success (result) ->
				callback null, { output: outputDir }
	