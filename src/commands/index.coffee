fs = require "fs"

module.exports = fs.readdirSync(__dirname).filter((file) ->
  not /.DS_Store|index/.test(file)
).map((file) ->
  require __dirname + "/" + file
)
  