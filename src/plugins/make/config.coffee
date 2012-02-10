fs      = require "fs"
step    = require "stepc"
outcome = require "outcome"

###
 parses the options into an executable configuration
###

parseConfig = (ops, callback) ->
	console.log ops

###
 loads the config
###

exports.load = (file, callback) ->

	res = outcome.error callback
	
	# load from file
	step.async () ->
			fs.readFile file, "utf8", res.success @
		
		# parse the JSON

		,(configStr) ->
			@ JSON.parse configStr

		# build the config

		,(config) ->
			parseConfig config, callback