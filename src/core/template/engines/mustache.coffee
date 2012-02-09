mustache = require "mustache"

exports.name = "mu"


exports.setVars = (content, data, callback) -> 
	callback null, mustache.to_html content, data
	