

module.exports = (router, params) ->

	###
	###

	router.on 
		
		
		###
		 recusively fills template files with data provided
		###

		"pull fill/templates": (req, res, mw) ->

			output = mw.data('output')

			console.log "filling templates"

			mw.next();
			