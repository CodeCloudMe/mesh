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

		"push module/dir": (dir) -> moduleDirs.push dir

			


