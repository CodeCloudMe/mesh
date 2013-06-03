module.exports = 
  "def run":
    "run": (context, next) ->
      @all.run context.get("value"), next