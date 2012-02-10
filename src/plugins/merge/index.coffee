path  = require "path"
merge = require "./merge"
async = require "async"

exports.plugin = (router, params) ->
		
	moduleDirs = [ params.modulesDir ]



	router.on


		###
		 Merges two directories together
		###

		"pull merge": (req, res, mw) ->
			

			# src dir
			input   = mw.data('input')


			platform = mw.data('platform')


			merge {
				input:  input,
				platform: platform,
				router: router
			}, res.success (result) -> 
				req.sanitized.intermediate = result.output
				res.end result if not mw.next()


		###
		###

		"pull find/module/dir": (req, res) ->
				
			# module to find
			module = req.query.module

			# dirs to scan
			allModuleDirs = moduleDirs.concat req.query.dirs || []
			
			possibilities = []

			# push the possible directories
			possibilities.push "#{dir}/#{module}" for dir in allModuleDirs


			# find the files that exist, and return the first result
			async.filter possibilities, path.exists, (results) ->
				return res.error new Error "module \"#{module}\" does not exist" if not results.length
				res.end results.shift()

			
		###
		###

		"push module/dir": (dir) -> moduleDirs.push dir

			


