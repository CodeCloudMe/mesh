_  = require "underscore"
fs = require "fs"

###
 returns the directories which intersect
 with the platforms given
###	

module.exports = (dirs) ->
		
	if typeof dirs == 'string'
		dirs = fs.readdirSync dirs

	allDirs = []

	for dir in dirs
		allDirs = allDirs.concat dir.split " "

	return _.uniq allDirs