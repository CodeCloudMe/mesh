DirMerge = require "./DirMerge"

module.exports = class DepMerge extends DirMerge
	
	###
	###

	_onDirsMerged: () ->

		#scan the for dependencies