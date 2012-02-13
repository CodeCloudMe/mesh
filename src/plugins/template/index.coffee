_        = require "underscore"
fs       = require "fs"
ejs      = require "ejs"
utils    = require "./utils"
findit   = require "findit"

exports.plugin = (router, params) ->

	###
	###

	router.on 
		
		
		###
		 recusively fills template files with data provided
		###

		"pull fill/templates": (req, res, mw) ->

			output = mw.data('output')
			data   = _.defaults mw.data(), {
				defaultPlatform: "node"
			}


			utils.findAndFillTemplates output, data, res.success () ->
				return res.end true if not mw.next()



		
			