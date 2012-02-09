merge     = require("./operations/DirMerge").start
bootstrap = require "./bootstrap"

###

1. bootstrap
2. merge platform
3. make

###


###
 This starts the project off with the basics required
 for mesh to operate on the next steps: merge & make
###

exports.bootstrap = (ops, callback) ->


###
 this merges the projects together for a target framework
###

exports.merge = merge

### 
 this makes a project for a target platform
###

exports.make = (ops, callback) ->



###
 Uses a module for the build processes: bootstrap, and make
###

exports.use = (module) ->
	
	# add bootstrap middleware
	bootstrap.add module.bootstrap if module.bootstrap


