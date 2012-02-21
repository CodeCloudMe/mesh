ncp    = require("ncp").ncp
_      = require "underscore"
fs     = require "fs"
path   = require "path"
mkdirp = require "mkdirp" 
step   = require("stepc")
npm    = require "npm"

exports.plugin = (router, params) ->
		
	# the directory where all the scaffolding stuff lives
	bootstrapDir    = params.dir
	bootstrapSrcDir = bootstrapDir + "/src"

	router.on


		###
		 bootstraps a program by copying the target platform
		 over to a new directory
		###

		"pull \
		copy/platforms -> \
		fill/templates -> \
				bootstrap": (req, res) ->

			console.log "bootstrapped!"
			

		###
		 copies the target platforms from the scaffolding directory
		 over to the output dir
		###

		"pull v/output -> target/platform/dirs -> copy/platforms": (req, res, mw) ->


			output    = mw.data('output')
			outputSrc = output + "/src"
			toCopy    = req.sanitized.targetPlatformDirs

			
			console.log "copying target platforms"


			## first make the output directory
			step.async () -> 
					mkdirp outputSrc, 0777,  @
					
				## then read the files from the bootstrap dir
				,() -> 
					fs.readdir bootstrapDir, res.success @
				
				## find the FILES - not directories
				,(files) ->
					copiable = [] 

					for file in files
						file = "#{bootstrapDir}/#{file}"
						copiable.push file if not fs.lstatSync(file).isDirectory()

					@ copiable
				
				## copy the files to the root directory (makefile, package.json, etc.)
				,(copyFiles = (files) ->
					return @() if not files.length

					file = files.shift()	

					ncp file, "#{output}/#{path.basename file}", res.success () => copyFiles.call @, files
				)

				## copy the target platforms over
				, (copyPlatform = () ->
					return @() if not toCopy.length

					dir = toCopy.shift()

					ncp dir, "#{outputSrc}/#{path.basename dir}", res.success () => copyPlatform.call @
				)

				## move onto the next route, or return true for
				## success
				,() ->
					res.end true if not mw.next()
					


		
		###
		 returns the platform directories
		###

		"pull platform/dirs": (req, res, mw) ->
			
			allDirs = []

			# input can be specified, OR use the bootstrap dir
			input = req.query.platformDir || bootstrapSrcDir

			fs.readdir input, res.success (dirs) ->
				
				for dir in dirs		
					
					# skip any private files - mainly .DS_Store		
					continue if dir.substr(0,1) == "."
					allDirs.push "#{input}/#{dir}"

				req.sanitized.platformDirs = allDirs

				res.end allDirs if not mw.next()

		###
		 finds the target platform dirs, and filters out the rest
		###

		"pull platform/dirs -> target/platform/dirs": (req, res, mw) ->

			## platforms we want to filter out
			platforms = req.query.platforms || []

			dirs = [];

			dirs = dirs.concat(findTargetDirs(req.sanitized.platformDirs, platform.split(":"))) for platform in platforms


			req.sanitized.targetPlatformDirs = dirs

			## return the response if this isn't middleware
			res.end dirs if not mw.next()



# finds target directories based on the target platforms given:
# web, web:firefox, web:firefox:6

findTargetDirs = (allFiles, targetPlatforms) ->
	

	numTargetPlatforms = targetPlatforms.length
	
	# next find the files targeted towards the given platform
	allFiles.filter (dir) ->
			
		# platform: web/firefox safari/4
		dirParts = path.basename(dir).split /\s*\>\s*/g 

		for platform, i in dirParts
			
			# it's a missmatch if we compile web against web:safari, web:firefox, web:firefox:6
			# we don't want ffox 6 code mixing with safari code....
			return false if i == numTargetPlatforms
			
			return false if not _.intersection(platform.split(" "), [targetPlatforms[i], "common"]).length

		return true
