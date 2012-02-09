template  = require "./template"
Bootstrap = require "./bootstrap"
merge 	  = require "./merge"

###

1. bootstrap
2. merge
3. make

###

class Mesher
	
	###
	###

	constructor: (ops) ->
		@_templateFactory = template.factory()
		@_bootstrap 	  = new Bootstrap @_templateFactory, ops.getTemplateData


	###
	###

	bootstrap: (ops, callback) -> @_boostrap.start ops, callback

	###
	###

	merge: (ops, callback) -> merge(ops, callback)

	###
	 TODO
	###

	make: (ops, callback) ->  




exports.mesher = (ops) -> 
	
	ops = {} if not ops

	new Mesher ops