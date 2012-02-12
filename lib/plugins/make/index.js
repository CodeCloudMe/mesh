(function() {
  var Config, async, fs, step;

  fs = require("fs");

  step = require("stepc");

  async = require("async");

  Config = require("./make/config");

  exports.plugin = function(router, params) {
    var makeConfigs;
    makeConfigs = [params.configPath];
    return router.on({
      /*
      		 loads the mesh config
      */
      "pull make/config": function(req, res, mw) {
        var cfg;
        cfg = req.sanitized.makeConfig = new Config();
        return async.forEach(makeConfigs, function(file, next) {
          return cfg.loadFile(file, next);
        }, res.success(function() {
          if (!mw.next()) return res.end(cfg);
        }));
      },
      /*
      */
      "pull merge -> make/config -> make": function(req, res) {
        var cfg, input, phase;
        input = req.sanitized.intermediate;
        cfg = req.sanitized.makeConfig;
        phase = req.query.phase;
        return step.async(function() {
          return cfg.loadFile("" + input + "/mesh.json", res.success(this));
        }, function(config) {
          return cfg.targets.build(phase, res.success(function(result) {
            return res.end(result);
          }));
        });
      },
      /*
      		 ability for third-party modules to extend the build system
      */
      "push make/config/path": function(configPath) {
        return makeConfigs.push(configPath);
      }
    });
  };

}).call(this);
