(function() {
  var config, fs, step;

  step = require("stepc");

  fs = require("fs");

  config = require("./config");

  exports.plugin = function(router, params) {
    /*
    */    return router.on({
      /*
      */
      "pull merge -> make": function(req, res) {
        var input;
        input = req.sanitized.intermediate;
        return step.async(function() {
          return config.load("" + input + "/mesh.json", "utf8", res.success(this));
        }, function(config) {
          return console.log(config);
        });
      }
    });
  };

}).call(this);
