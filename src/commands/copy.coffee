fs        = require "fs"
path      = require "path"
mkdirp    = require "mkdirp"
flatstack = require "flatstack"
outcome   = require "outcome"

module.exports = 
  "def copy": 
    "run": (context, next) -> 

      input   = context.get("input")
      output  = context.get("output")
      baseDir = context.get("baseDir")
      process = context.get("processContent")

      if baseDir
        baseDir = path.normalize baseDir


      stat = fs.statSync(input)
      if stat.isDirectory()
        return mkdirp output, () => next()

      callstack = flatstack()

      callstack.push () ->
        mkdirp path.dirname(output), callstack.pause().resume

      callstack.push () =>

        content = fs.readFileSync input
        context.set "content", content

        if process
          @run process, context, callstack.pause().resume

      callstack.push () =>
        fs.writeFile context.get("output"), context.get("content"), next

