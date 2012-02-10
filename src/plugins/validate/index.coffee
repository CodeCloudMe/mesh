exports.plugin = (router, params) ->

	###
	###

	router.on 
		
		
		###
		 recusively fills template files with data provided
		###

		"pull v/output": (req, res, mw) ->

			output = mw.data("output")

			return res.end new Error "output is not present" if not output

			req.sanitized.output = output

			mw.next()
			