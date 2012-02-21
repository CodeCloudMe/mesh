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
        var cfg, input, task;
        input = req.sanitized.intermediate;
        cfg = req.sanitized.makeConfig;
        task = req.query.task;
        return step.async(function() {
          var _this = this;
          return cfg.loadFile("" + input + "/mesh.json", function() {
            return _this(cfg);
          });
        }, function(config) {
          return cfg.tasks.build(task, {
            target: task
          }, res.success(function(result) {
            return res.end(result);
          }));
        }, function(err) {
          return res.error(err);
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
