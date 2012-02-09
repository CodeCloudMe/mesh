ncp   = require("ncp").ncp
_     = require "underscore"
fs    = require "fs"
async = require "asyncjs"
path  = require "path"


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
			build/makefile -> \
				bootstrap": (req, res) ->

			console.log "bootstrapped!"
			

		###
		 copies the target platforms from the scaffolding directory
		 over to the output dir
		###

		"pull v/output -> platform/dirs -> copy/platforms": (req, res, mw) ->
			

			platforms = mw.data('platforms') || []
			output    = mw.data('output') + "/src"
			toCopy = []

			for dir in req.sanitized.platformDirs
				
				## only copy the dir if it's been specified as a target
				toCopy.push "#{bootstrapSrcDir}/#{dir}" if _.intersection(platforms, dir.split " ").length

			
			async.
			list(toCopy).
			each (dir, next) ->
				ncp dir, "#{output}/#{path.basename dir}", next
			.
			end res.success () ->
				console.log "COPIED"

			console.log "copying target platforms"
			mw.next()

			

		###
		 builds a makefile for the target platforms located in the output directory
		###

		"pull build/makefile": (req, res, mw) ->
			console.log "building makefile"
			mw.next()

		
		###
		 returns the platform directories
		###

		"pull platform/dirs": (req, res, mw) ->
			
			allDirs = []

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
			
			allDirs = []

			for dir in mw.sanitized.platformDirs				
				allDirs = allDirs.concat dir.split " "

				
			## filter out any duplicate platforms
			req.sanitized.platforms = allDirs = _.uniq allDirs

			## return the response if this isn't middleware
			res.end allDirs if not mw.next()


					
					
					
					
							

