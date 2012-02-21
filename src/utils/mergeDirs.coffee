dirmr = require "dirmr"
_     = require "underscore"
path  = require "path"

module.exports = (platformDir, platforms) ->

	# finds target directories based on the target platforms given:
	# web, web:firefox, web:firefox:6

	findTargetDirs = (dir) ->
		
		for targetPlatform, i in platforms
			
			targetPlatform = targetPlatform.split ":"
			dirParts = path.basename(dir).split /\s*\>\s*/g 
			hasMatch = true

				
			for platform, j in dirParts 

				if j == targetPlatform.length || not _.intersection(platform.split(" "), [targetPlatform[j], "common"]).length
					hasMatch = false
					break

			if hasMatch
				# console.log dir
				return true

		return false

	
	
	dirmr().
	readdir(platformDir, findTargetDirs)



module.exports.mergeJSON = dirmr.mergeJSON
module.exports.parseTemplate = dirmr.parseTemplate





