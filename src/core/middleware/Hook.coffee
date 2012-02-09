Queue = require "./Queue"

module.exports = class Hook 
	
	###
	###

	constructor: () ->
		@_pre  = []
		@_mid  = []
		@_post = [] 
 
 	###
	###

	pre: (middleware) -> @_pre.push middleware


	###
	###

	mid: (middleware) -> @_mid.push middleware

	###
	###

	post: (middleware) -> @_post.push middleware

	###
	###

	run: (target, callback) ->
		
		q = new Queue target

		q.add @_pre.concat(@_mid).concat(@_post)

		q.onComplete callback

		q.start()

		

		