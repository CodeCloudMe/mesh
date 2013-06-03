var mesh = require(".."),
expect   = require("expect.js");

describe("each", function() {

  var def;

  it("can be setup", function() {
    def = mesh.run({
      "def eachUntil": {
        "run": {
          "each": {
            "source": function(context, next) {
              var stack = [];
              for(var i = context.get("limit"); i--;) stack.push(i);
              next(null, stack)
            }
          }
        }
      }
    });
  })

  it("can run an each-limit loop", function(next) {
    var i = 0;
    def.run({
      "eachUntil": {
        "limit": 5,
        "as": "num",
        "run": function(context) {
          expect(context.get("num")).not.to.be(undefined);
          i++;
        }
      },
      "run": function() {
        expect(i).to.be(5);
      }
    }, next);
  });
}); 