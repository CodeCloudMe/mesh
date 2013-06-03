var expect = require("expect.js"),
mesh       = require("..");

describe("eachFile", function() {
  var ms;

  it("can run an each-file command", function(next) {
    ms = mesh.run({
      "eachFile": {
        "cwd": __dirname,
        "watch": true,
        "run": {
          "copy": {
            "setup": function(context) {
              context.set("output", context.get("input").replace("fixtures/src", "fixtures/lib"));
            },
            "processContent": function(context, next) {
              console.log(String(context.get("content")));
              context.set("content", "blah!");
              next();
            }
          }
        }
      },
    }, { "input": "fixtures/src/**", "output": "fixtures/lib" }, next);
  });


});