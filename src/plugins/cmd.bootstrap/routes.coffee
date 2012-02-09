ncp    = require("ncp").ncp
_      = require "underscore"
fs     = require "fs"
async  = require "asyncjs"
path   = require "path"
mkdirp = require "mkdirp" 
step   = require "step"


module.exports = (router, params) ->
		
	# the directory where all the scaffolding stuff lives
	bootstrapDir = params.dir
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

		"pull v/output -> platforms -> copy/platforms": (req, res, mw) ->
			

			platforms = mw.data('platforms') || []
			output    = mw.data('output') + "/src"
			toCopy    = []

			toCopy.push "#{bootstrapSrcDir}/#{dir}"  for dir in req.sanitized.platformFolders

			
			console.log "copying target platforms"


			## first make the output directory
			step () -> 
					mkdirp output, 0777,  @
				
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

					ncp dir, "#{output}/#{path.basename dir}", res.success () => copyPlatform.call @
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

			# skip
			mw.next() if req.sanitized.platformDirs

			fs.readdir bootstrapSrcDir, res.success (dirs) ->
				
				for dir in dirs		
					
					# skip any private files - mainly .DS_Store		
					continue if dir.substr(0,1) == "."
					allDirs.push dir

				req.sanitized.platformDirs = allDirs

				res.end allDirs if not mw.next()

		###
		 returns the available platforms
		###

		"pull platform/dirs -> platforms": (req, res, mw) ->
				
			# skip 
			mw.next() if req.sanitized.allPlatforms

			platforms = mw.data('platforms') || []

			allDirs = []
			platformFolders = []

			for dir in req.sanitized.platformDirs		
				dirParts = dir.split " "		
				allDirs = allDirs.concat dirParts

				## only copy the dir if it's been specified as a target
				platformFolders.push dir if _.intersection(platforms, dirParts).length

				
			## filter out any duplicate platforms
			req.sanitized.allPlatforms      = allDirs = _.uniq allDirs
			req.sanitized.platformFolders   = platformFolders

			## return the response if this isn't middleware
			res.end allDirs if not mw.next()


					
					
					
					
							

