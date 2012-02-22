_       = require "underscore"
fs      = require "fs"
walkr   = require "walkr"
step    = require "stepc"
path    = require "path"
async   = require "async"
mkdirp  = require "mkdirp"
outcome = require "outcome"
structr = require "structr"
Seq     = require "seq"
mergeDirs = require "../../utils/mergeDirs"
resolve = require "resolve"

module.exports = (ops, callback) ->
	
	dir = ops.input
	platforms = ops.platform.split ":" #web:firefox:6

	dirs = _findTargetDirs dir, platforms






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

	outputPkg  = null

	platformDirs = null

	appPkg = null

	incModules = []

	nodeModulesDir   = "#{input}/node_modules"
	outputModulesDir = null
	linkTo           = ops.link

	step.async () -> 
		readPackageConfig "#{input}/package.json",  @

	# based on the config, set the SOURCE, and the OUTPUT

	,res.success( (config) ->
		console.log "merge #{config.original.name}"
		appPkg    = config.original
		sourceDir = config.src
		outputDir = outputDir || path.normalize "#{config.lib}/#{platform}"
		outputPkg = "#{outputDir}/package.json"
		outputModulesDir = "#{outputDir}/node_modules"
		@()
	)

	# first make the output dir
	,() ->
		mkdirp outputModulesDir, 0777, @

	,() ->
		fs.writeFileSync outputPkg, JSON.stringify({}, null, 2)
		@()

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

		mergeDirs(sourceDir, [platform]).
		filterFile(/\.merge\.json/, mergeDirs.mergeJSON(".json")).
		filterFile(/package\.json/, mergeDirs.mergeJSON(".json", appPkg)).
		filterFile(mergeDirs.parseTemplate({})).
		join(outputDir).
		complete(@)
	)

	,res.success( () ->
		
		deps = Object.keys(JSON.parse(fs.readFileSync(outputPkg, "utf8")).dependencies || {})
		
		deps = deps.concat Object.keys(appPkg.dependencies || {})

		@ null, deps = _.uniq deps

	)

	# filter out any modules that CANNOT be meshed
	,res.success( (deps) ->

		pkgPaths = []


		pkgPaths.push "#{input}/node_modules/#{dep}/package.json" for dep in deps

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


###
###

readPackageConfig = (pkg, callback) ->
	fs.readFile pkg, "utf8", (err, content) ->
		config = if content then JSON.parse content else {}

		dir = path.dirname pkg

		loaded = { dir: dir }

		config.directories = {} if not config.directories

		dirs = config.directories

		loaded.src     = path.normalize "#{dir}/#{(dirs["mesh-src"] || 'src')}"
		loaded.lib     = path.normalize "#{dir}/#{(dirs.lib || 'lib')}"

		loaded.original = config

		callback null, loaded

###
###
		
linkToParent = (outputDir, to, callback) ->
	return callback() if not to

	step.async () ->
			fs.unlink to, @
		,() ->
			fs.symlink outputDir, to, @
		, callback

###
###

meshable = (pkg, callback) ->

	step.async () ->
			fs.readFile pkg, "utf8", @
		, (err, content) ->
			return callback false if err
			try 
				callback JSON.parse(content).directories["mesh-src"]
			catch e
				callback false


	