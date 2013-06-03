commands = require "./commands"
ribbit   = require "ribbit"

exports.run = (source, context, next) ->
  exports.load().run(source, context, next)

exports.load = (context, next) -> ribbit.run commands, context, next
