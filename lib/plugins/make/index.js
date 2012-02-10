(function() {
  var Config, async, fs, step;

  step = require("stepc");

  fs = require("fs");

  Config = require("./make/config");

  async = require("async");

  exports.plugin = function(router, params) {
    var makeConfigs;
    makeConfigs = [params.configPath];
    return router.on({
      /*
      */
      "pull merge -> make": function(req, res) {
        var cfg, input;
        input = req.sanitized.intermediate;
        cfg = new Config();
        return step.async(function() {
          return async.forEach(makeConfigs, function(file, next) {
            return cfg.loadFile(file, next);
          }, res.success(this));
        }, function() {
          return cfg.loadFile("" + input + "/mesh.json", res.success(this));
        }, function(config) {
          return cfg.targets.build("debug", res.success(function(result) {
            return res.end(result);
          }));
        });
      }
    });
  };

}).call(this);
