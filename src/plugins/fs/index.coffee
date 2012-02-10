fs     = require "fs"
findit = require "findit"
ncp	   = require("ncp").ncp
path   = require "path"

exports.plugin = (router, params) ->


	###
	###


	router.on
		
		###
		 finds files with regexp given
		###

		"pull find/files": (req, res, mw) ->
			
			console.log "find file"

			search = req.query.search
			dir    = req.query.input


			find = findit dir

			found = []

			find.on "file", (file) ->
				found.push file if search.test file	

			find.on "end", () ->
				req.sanitized.foundFiles = found
				res.end found if not mw.next()

		###
		 copies found files to a new destination. Usually
		 as an intermediate directory
		###

		"pull find/files -> copy/files": (req, res) ->

			output = req.query.output
		
			copyFiles = (files) ->
				res.end true if not files.length

				file = files.shift()

				ncp file, "#{output}/path.basename file", () -> copyFiles files



			