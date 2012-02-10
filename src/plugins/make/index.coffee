step   = require "stepc"
fs     = require "fs"
config = require "./config"

exports.plugin = (router, params) ->

	###
	###


	router.on 

		###
		###

		"pull merge -> make": (req, res) ->

			input = req.sanitized.intermediate

			# start the build phase

			step.async () ->
				config.load "#{input}/mesh.json", "utf8", res.success @

			,(config) ->
				console.log config
