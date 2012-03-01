(function() {
  var async, capirona, fs, step;

  fs = require("fs");

  step = require("stepc");

  async = require("async");

  capirona = require("capirona");

  exports.plugin = function(router, params) {
    var makeConfigs;
    makeConfigs = [params.configPath];
    return router.on({
      /*
      		 loads the mesh config
      */
      "pull make/config": function(req, res, mw) {
        var cfg, config, _i, _len;
        cfg = req.sanitized.makeConfig = capirona.make();
        for (_i = 0, _len = makeConfigs.length; _i < _len; _i++) {
          config = makeConfigs[_i];
          cfg.load(config);
        }
        return cfg.next(function() {
          if (!mw.next()) res.end(cfg);
          return this();
        });
      },
      /*
      */
      "pull merge -> make/config -> make": function(req, res) {
        var cfg, input, pkg, task;
        input = req.query.input;
        cfg = req.sanitized.makeConfig;
        task = req.query.task;
        pkg = JSON.parse(fs.readFileSync("" + req.sanitized.intermediate + "/package.json", "utf8"));
        return step.async(function() {
          var _this = this;
          return cfg.load("" + input + "/make.json", function() {
            return _this(cfg);
          });
        }, function(config) {
          return cfg.run(task, {
            cwd: req.sanitized.intermediate,
            target: task,
            directories: {
              root: "" + req.sanitized.intermediate,
              src: "" + req.sanitized.intermediate + "/" + pkg.directories['mesh-src'],
              lib: "" + req.sanitized.intermediate + "/" + (pkg.directories.lib || 'lib')
            }
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
