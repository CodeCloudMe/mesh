template  = require "./core/template"
Bootstrap = require "./core/bootstrap"
merge 	  = require "./core/merge"
getPlatforms = require "./core/utils/getPlatforms"
###

1. bootstrap
2. merge
3. make

###

BOOTSTRAP_DIR = __dirname + "/platform/bootstrap"
MAKE_DIR	  = __dirname + "/platform/make"



class Mesher
	
	###
	###

	constructor: (ops) ->
		
		@_templateFactory = template.factory()
		@_bootstrap 	  = new Bootstrap BOOTSTRAP_DIR, @_templateFactory, ops.getTemplateData
		@_platforms 	  = getPlatforms BOOTSTRAP_DIR


	###
	###

	bootstrap: (ops, callback) -> @_bootstrap.start ops, callback

	###
	###

	merge: (ops, callback) -> merge(ops, callback)

	###
	 TODO
	###

	make: (ops, callback) ->  

	###
	###

	platforms: () -> @_platforms




exports.mesher = (ops) -> 
	
	ops = {} if not ops

	new Mesher ops