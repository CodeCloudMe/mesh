async     = require "async"
type      = require "type-component"
flatstack = require "flatstack" 
outcome   = require "outcome"

###

each:
  source: [1, 2, 3, 4, 5]
  sum: 0
  as: "number"
  run: (context) ->
    context.set("sum", context.get("sum") + context.get("number"))

###

run = (context, next) -> 

  as        = context.get("as") or "value"
  source    = context.get("source")
  run       = context.get("run")
  parallel  = context.get("parallel") or 10
  o         = outcome.e next
  callstack = flatstack()


  callstack.push (nex) =>
    return next() if type(source) isnt "function"

    if source.length is 2
      source.call @, context, o.s (src) ->  
        source = src
        nex()
    else
      source = source.call @, context
      nex()

  callstack.push (next) =>
    async.eachLimit source, parallel, ((item, next) =>

      data = {}
      data[as] = item

      @run run, context.child(data), next
    ), o.s next

  callstack.push next


module.exports = 
  "def each":
    "run": run


