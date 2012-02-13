fs          = require "fs"
findit      = require "findit"
outcome     = require "outcome"
handlebars  = require "handlebars"

###
###

exports.findAndFillTemplates = (directory, data, callback) ->

	find = findit directory

	tplFiles = []


	## first find the files
	find.on "file", (file) =>
		return if not /\.hb/.test file
		tplFiles.push file
		
	find.on "end", () =>

		## when we're done scanning, write the files
		exports.fillTemplates tplFiles, data, callback
	

###
###

exports.fillTemplates = (tplFiles, data, callback) ->
	
	return callback() if not tplFiles.length

	onResult = outcome.error callback

	file = tplFiles.shift()


	exports.fillTemplate file, data, onResult.success () -> exports.fillTemplates tplFiles, data, callback


###
###

exports.fillTemplate = (tplFile, data, callback) ->

	onResult = outcome.error callback


	## read the tpl data
	fs.readFile tplFile, "utf8", onResult.success (content) ->
		
		tpl = handlebars.compile(content)(data)


		## write the output
		fs.writeFile tplFile.replace('.hb',''), tpl, onResult.success () ->
			
			## remove the template file
			fs.unlink tplFile, callback
	



	