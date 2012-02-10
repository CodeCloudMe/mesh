mkdirp = require "mkdirp"
ncp    = require("ncp").ncp
step   = require "stepc"
async  = require "async"
fs     = require "fs"
_      = require "underscore"
path   = require "path"
rmdirr = require "rmdirr"

exports.plugin = (router) ->
	


	router.on


		###
		 Merges two directories together
		###

		"pull merge": (req, res, mw) ->
			
			# lib dir
			output  = mw.data('output')

			# src dir
			input   = mw.data('input')

			platform = mw.data('platform').split('+')

			step.async () -> 
					console.log "rm #{output}"
					rmdirr output, @

				# first make the output dir
				,() ->
					console.log "mk #{output}"
					mkdirp output, 0777, res.success @

				# find the target platform first
				,() ->
					console.log "finding sources"
					router.request("target/platform/dirs").query({ platformDir: input, platforms: platform }).response(res.success @).pull()
				
				# copy the target platforms to the output directory
				,(dirs) ->
					console.log "merging sources"
					async.forEach dirs
						,(dir, next) ->
							ncp dir, output, next
						,res.success () => 
							@ dirs	


				# next need to find the mesh files
				,(dirs) -> 
					console.log "finding mesh configs"
					meshFiles = []
					meshFiles.push "#{dir}/mesh.json" for dir in dirs

					async.filter meshFiles, path.exists, @
					
				
				# now merge the files together into one mesh file
				,(meshFiles) ->
					console.log "merging mesh configs"
					async.map meshFiles, fs.readFile, res.success (results) =>
						cfg = [];

						for str in results
							try
								cfg.push JSON.parse str.toString()
							catch e
								throw new Error "unable to parse mesh file"

						@ _.extend.apply null, cfg

				
				# save the mesh config
				,(meshConfig) ->
					console.log "writing mesh config"
					fs.writeFile "#{output}/mesh.json", JSON.stringify(meshConfig, null, 2), @

				# done
				,() ->
					res.end true


