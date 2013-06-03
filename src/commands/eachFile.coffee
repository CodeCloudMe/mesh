fs   = require "fs"
glob = require "glob"

###
eachFile:
  input: /dir
  run:
    copy:
      output: 
###

module.exports = 
  "def eachFile":
    "run":
      "each":
        "as": "input"
        "source": (context, next) -> 

          run   = context.get("run")
          cwd   = context.get("cwd") or process.cwd()
          watch = !!context.get("watch")

          _getFiles context, next

          if watch 
            _watch.call @, context

###
###

_getFiles = (context, next) ->
  cwd   = context.get("cwd") or process.cwd()
  input = context.get("input")
  glob input, { cwd: cwd }, (err, files) ->
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

  _watched = []

  
  onChange = (file) =>
    @run context.get("run"), context.child({input:file})


  watchFile = (file, triggerAdded) ->
    return if ~_watched.indexOf(file)
    _watched.push file

    if triggerAdded
      onChange file

    fs.watchFile file, { persistent: true, interval: 500 }, (cur, prev) ->
      return if cur.nlink != 0 and cur.mtime.getTime() == prev.mtime.getTime()

      # file removed
      # if cur.nlink == 0

      onChange file


  
  getFiles = (triggerAdded) ->
    _getFiles context, (err, files) ->
      for file in files
        watchFile file, triggerAdded


  getFiles()
  setInterval getFiles, 4000
    







