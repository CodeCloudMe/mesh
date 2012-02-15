_       = require "underscore"
fs      = require "fs"
step    = require "stepc"
path    = require "path"
async   = require "async"
mkdirp  = require "mkdirp"
rmdirr  = require "rmdirr"
outcome = require "outcome"

###
###

copyMergeable = (input, output, next) ->
	
	output = output.replace(".merge", "");

	step.async () ->
			path.exists output, @
		,(outExists) ->
			ocfg = if outExists then JSON.parse(fs.readFileSync(output, "utf8")) else {}
			icfg = JSON.parse(fs.readFileSync(input, "utf8"))

			ofg = _.extend(ocfg, icfg);

			fs.writeFileSync output, JSON.stringify(ofg, null, 2);
			next()


###
###

copyFile2 = (input, output, next) ->
	readStream  = fs.createReadStream input
	writeStream = fs.createWriteStream output
	readStream.pipe(writeStream)
	readStream.once('end', next)
###
###

copyFile = (input, output, next) ->
		
	return copyMergeable input, output, next if input.match(/\.merge\.json/)
	copyFile2 input, output, next
	
		

copyDir = (input, output, next) ->
	
	res = outcome.error next


	step.async () ->
			mkdirp output, 0777, @
		,() ->
			fs.readdir input, @
		,res.success( (files) ->	
			async.forEach files,
				(file, next) ->
					ifile = "#{input}/#{file}"
					ofile   = "#{output}/#{file}"

					copyr ifile, ofile, next
				, next
		)
		
###
###

copyr = (input, output, next) ->

	res = outcome.error () ->
		return next new Error "#{input} does not exist"

	fs.lstat input,	res.success (stat) ->

		return copyDir(input, output, next) if stat.isDirectory()
		return copyFile input, output, next