fs   = require "fs"
glob = require "glob"
watch_r = require "watch_r"
path = require "path"
###
eachFile:
  input: /dir
  run:
    copy:
      output: 
###

module.exports = 
  "def eachFile":
    "params":
      "watch":
        "description": "watches the files"
    "run": [
      {
        "each":
          "as": "input"
          "source": (context, next) -> 

            run   = context.get("run")
            cwd   = context.get("cwd") or process.cwd()

            _getFiles context, next
      },
      (context, next) ->
        next()
        if !!context.get("watch")
          _watch.call @,  context


    ]

###
###

_getFiles = (context, next) ->
  cwd   = context.get("cwd") or process.cwd()
  input = context.get("input")
  glob input, { cwd: cwd }, (err, files) ->
    return next(err) if err?
    files = files.map((file) ->
      try 
        fs.realpathSync cwd + "/" + file
      catch e
        file
    ).filter((file) ->
      not fs.statSync(file).isDirectory()
    )

    next null, files

###
###

_watch = (context) ->


  
  onChange = (file) =>
    @run context.get("run"), context.child({input:file})



  pt = context.get("input")

  pt = pt.replace(/\*\*.*/,"")

  _processing = {}

  watch_r pt, (err, watcher) ->

    watcher.on "new", (target) ->
      onChange target.path
    watcher.on "change", (target) ->
      onChange target.path
    watcher.on "remove", (target) ->



    







