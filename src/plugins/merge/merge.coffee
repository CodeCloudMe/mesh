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

readPackageConfig = (pkg, callback) ->
	fs.readFile pkg, "utf8", (err, content) ->
		config = if content then JSON.parse content else {}

		dir = path.dirname pkg

		loaded = { dir: dir }

		config.directories = {} if not config.directories

		dirs = config.directories

		loaded.src     = path.normalize "#{dir}/#{(dirs["mesh-src"] || '')}"
		loaded.lib     = path.normalize "#{dir}/#{(dirs.lib || 'lib')}"
		## loaded.interm  = path.normalize "#{dir}/#{(dirs.interm || 'intermediate')}"

		loaded.original = config

		callback null, loaded
		
###
###

copyMergeable = (input, output, next) ->
	
	output = output.replace(".merge", "");

	step.async () ->
			path.exists output, @
		,(outExists) ->
			ocfg = if outExists then JSON.parse(fs.readFileSync(output, "utf8")) else {}
			icfg = JSON.parse(fs.readFileSync(input, "utf8"))

			ofg = _.extend(ocfg, icfg);

			fs.writeFileSync output, JSON.stringify(ofg, null, 2);
			next()


###
###

copyFile2 = (input, output, next) ->
	readStream  = fs.createReadStream input
	writeStream = fs.createWriteStream output
	readStream.pipe(writeStream)
	readStream.once('end', next)
###
###

copyFile = (input, output, next) ->
		
	return copyMergeable input, output, next if input.match(/\.merge\.json/)
	copyFile2 input, output, next
	
		

copyDir = (input, output, next) ->
	
	res = outcome.error next


	step.async () ->
			mkdirp output, 0777, @
		,() ->
			fs.readdir input, @
		,res.success( (files) ->	
			async.forEach files,
				(file, next) ->
					ifile = "#{input}/#{file}"
					ofile   = "#{output}/#{file}"

					copyr ifile, ofile, next
				, next
		)
		
###
###

copyr = (input, output, next) ->

	res = outcome.error () ->
		return next new Error "#{input} does not exist"

	fs.lstat input,	res.success (stat) ->

		return copyDir(input, output, next) if stat.isDirectory()
		return copyFile input, output, next


linkToParent = (outputDir, to, callback) ->
	return callback() if not to

	step.async () ->
			fs.unlink to, @
		,() ->
			fs.symlink outputDir, to, @
		, callback


meshable = (pkg, callback) ->

	step.async () ->
			fs.readFile pkg, "utf8", @
		, (err, content) ->
			return callback false if err
			try 
				callback JSON.parse(content).directories["mesh-src"]
			catch e
				callback false
			


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
	outputDir  = null #ops.output

	platformDirs = null

	appPkg = null

	incModules = []

	nodeModulesDir = "#{input}/node_modules"
	outputModulesDir = null
	linkTo  = ops.link



	step.async () -> 
		readPackageConfig "#{input}/package.json",  @

	# based on the config, set the SOURCE, and the OUTPUT

	,res.success( (config) ->
		console.log "merge #{config.original.name}"
		appPkg    = config.original
		sourceDir = config.src
		outputDir = outputDir || path.normalize "#{config.lib}/#{platform}"
		outputModulesDir = "#{outputDir}/node_modules"
		@()
	)

	# first make the output dir

	,() ->
		mkdirp outputModulesDir, 0777, @

	,() ->	
		fs.readdir nodeModulesDir, @

	,(err, dirs) ->

		# node modules does not exist.
		return @() if err

		async.forEach dirs, 
			(dir, next) ->
				fs.symlink "#{nodeModulesDir}/#{dir}", "#{outputModulesDir}/#{dir}", () -> next()
			,@ 
	

	,res.success( () ->
		linkToParent outputDir, linkTo, @

	# find the target platform first
	)

	,res.success( () ->
		router.request("target/platform/dirs").query({ platformDir: sourceDir, platforms: [platform] }).response(@).pull()
	)


	# next need to find the mesh files

	,res.success( (dirs) -> 
		
		
		pkgFiles = []
		pkgFiles.push "#{dir}/package.json" for dir in dirs
		platformDirs = dirs


		async.map pkgFiles, readPackageConfig, @
	)
	# find the target config, and make the lib directory

	,res.success( (pkgs) ->

		# want the target platform to be copied last
		pkgs = pkgs.sort (a, b) -> if path.basename(a.dir) == platform  then 1 else -1


		targetPkg = pkgs.pop()



		libDir = path.normalize "#{outputDir}/#{targetPkg.original.directories.lib || ''}"

		@ pkgs, targetPkg, libDir
	)


	# copy the target platforms to the output directory

	,(pkgs, mainPkg, dir) ->
			
		async.forEach pkgs
			,(meshConfig, next) ->
				copyr meshConfig.src, dir, ->
					# merge might not exist
					copyr "#{meshConfig.dir}/mesh.merge.json", "#{outputDir}/mesh.merge.json", () -> next()
			, => 
				@ pkgs, mainPkg	
		
	,(pkgs, mainPkg) ->

		# make the directory - it could be something like "js" - for web
		copyr mainPkg.dir, outputDir, res.success () =>
			@ pkgs, mainPkg
	
	# now merge the files together into one mesh file

	,(pkgs, mainPkg) ->

		originalPkgs = []
		originalPkgs.push pkg.original for pkg in pkgs
		originalPkgs.push mainPkg.original



		pkg = _.extend.apply(null, originalPkgs) || {}
		
		delete appPkg.main

		# copy the root package to the new package - don't copy some stuff (main)
		pkg = _.defaults pkg, appPkg
		pkg.dependencies = _.extend pkg.dependencies || {}, appPkg.dependencies


		incModules = incModules.concat Object.keys(pkg.dependencies || {})

		@ pkg
	
	# save the mesh config
	

	,(config) ->

		fs.writeFile "#{outputDir}/package.json", JSON.stringify(config, null, 2), @

	# check to make sure the modules exist

	,res.success( () ->


		async.map incModules
			,(module, next) =>

				router.request("find/module/dir").query({ module: module, input: input, dirs: ["#{input}/modules", "#{input}/node_modules"] }).response(next).pull()
			,@

	)
		
	# filter out any modules that CANNOT be meshed
	,res.success( (moduleDirs) ->

		pkgPaths = []


		pkgPaths.push "#{dir}/package.json" for dir in moduleDirs


		async.filter pkgPaths, meshable, @
	)

	# recursively load the module configs

	,(pkgPaths) ->


		async.forEach pkgPaths
			,(pkgPath, next) =>

				modInput = path.dirname(pkgPath);

				# merge the module together
				merge {
					input: modInput, # the mesh.json file exists here

					# output is copied to new node_modules dir since main entry point could be different.
					link: "#{outputModulesDir}/#{path.basename(modInput)}"
					platform: platform,
					router: router
				}, next


			,@
	
	, res.success( () ->
		callback null, { output: outputDir }
	)