_      = require "underscore"
fs     = require "fs"
path   = require "path"
mkdirp = require "mkdirp" 
step   = require("stepc")
mergeDirs = require "../../utils/mergeDirs"
walkr     = require "walkr"

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
				bootstrap": (req, res) ->

			console.log "bootstrapped!"
			

		###
		 copies the target platforms from the scaffolding directory
		 over to the output dir
		###

		"pull v/output -> copy/platforms": (req, res, mw) ->


			output    = mw.data('output')

			## platforms we want to filter out
			platforms = req.query.platforms || []

			
			console.log "copying target platforms"

			data   = _.defaults mw.data(), {
				defaultPlatform: "node"
			}



			step.async () ->

					mergeDirs(bootstrapSrcDir, platforms).
					filterFile(mergeDirs.parseTemplate(data)).
					copyEach(output + "/src").
					complete @

				,() ->

					
					# copy top level files
					walkr(bootstrapDir, output).
					filter (options, next) ->
						next(options.source == bootstrapDir || !options.stat.isDirectory())
					.filterFile(walkr.parseTemplate(data))
					.filter(walkr.copy)
					.start @
					
				,(e) ->
					res.end true if not mw.next()					
			
			