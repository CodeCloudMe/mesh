fs      = require "fs"
step    = require "stepc"
outcome = require "outcome"
async   = require "async"

###
###

class MakeTarget

	###
	###

	constructor: (@config) ->

	###
	###

	parse: (ops, callback) ->
		@modules = ops.modules || []


MakeTarget.load = (ops, callback) ->

	mt = new MakeTarget
	mt.parse ops, callback

###
###

class Config 

	###
	 returns all modules - even make target modules
	###

	allModules: () ->
		allModules = []

		for target in @makeTargets
			allModules = allModules.concat target.modules 

		allModules
		

	###
	 parses a config 
	###


	parse: (ops, callback) ->

		modules     = ops.modules || []
		makeTargets = if ops.make then (ops.make.targets || []) else []
		
		# modules used in the entire build phase
		@modules     = modules
		@makeTargets = []
		
		step.async () ->
				async.map makeTargets, MakeTarget.load, res.success @
						
			,(makeTargets) =>
				@makeTargets = makeTargets
				@()
			
			,() ->



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