Bootstrap       = require "../middleware/Hook"
templateFactory = require "./template"


module.exports = (ops, callback) ->
	
	bs = new Bootstrap ops.input, ops.output, template	
