findit   = require "findit"
ejs      = require "ejs"
fs 		 = require "fs"
utils    = require "./utils"
_		 = require "underscore"

module.exports = (router, params) ->

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



		
			