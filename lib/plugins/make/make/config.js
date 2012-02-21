(function() {
  var BuilderFactory, Builders, ChainBuilder, Config, RefBuilder, ScriptBuilder, ShellBuilder, TargetBuilder, fs, outcome, path, step, traverse, _;

  fs = require("fs");

  path = require("path");

  step = require("stepc");

  outcome = require("outcome");

  Builders = require("./builders");

  traverse = require("traverse");

  BuilderFactory = require("./factory");

  _ = require("underscore");

  ChainBuilder = require("./adapters/chainBuilder");

  ScriptBuilder = require("./adapters/scriptBuilder");

  ShellBuilder = require("./adapters/shellBuilder");

  RefBuilder = require("./adapters/refBuilder");

  TargetBuilder = require("./adapters/targetBuilder");

  /* 
   the mesh config value object
  */

  module.exports = Config = (function() {
    /*
    */
    function Config() {
      var buildFactory, taskFactory;
      buildFactory = new BuilderFactory();
      buildFactory.addBuilderClass(ChainBuilder);
      buildFactory.addBuilderClass(ScriptBuilder);
      buildFactory.addBuilderClass(ShellBuilder);
      buildFactory.addBuilderClass(RefBuilder);
      taskFactory = new BuilderFactory();
      taskFactory.addBuilderClass(ChainBuilder);
      taskFactory.addBuilderClass(TargetBuilder);
      taskFactory.addBuilderClass(RefBuilder);
      this.vars = {};
      this.builders = new Builders(buildFactory, this);
      this.tasks = new Builders(taskFactory, this.builders, this);
    }

    /*
    	 loads a config from disc - important because they MAY contain
    	 scripts - in which case we'll need the CWD
    */

    Config.prototype.loadFile = function(file, callback) {
      var res,
        _this = this;
      res = outcome.error(callback);
      this.cwd = path.dirname(file);
      return step.async(function() {
        return fs.readFile(file, "utf8", res.success(this));
      }, function(configStr) {
        try {
          return this(JSON.parse(configStr));
        } catch (e) {
          return callback(e);
        }
      }, function(config) {
        _this.load(config);
        return callback(null, _this);
      });
    };

    /*
    	 parses a mesh config
    */

    Config.prototype.load = function(config) {
      var self;
      self = this;
      traverse(config).forEach(function(v) {
        if (typeof v === 'string' && /^(\.|~)+(\/\w*)+/.test(v)) {
          return this.update(path.normalize(v.replace(/^\./, self.cwd + "/.").replace(/^~/, process.env.HOME + "/")));
        }
      });
      if (config.build) this.builders.load(config.build);
      if (config.tasks) this.tasks.load(config.tasks);
      if (config.vars) return this._loadVars(config.vars);
    };

    /*
    */

    Config.prototype._fixConfig = function(config) {
      var key, value, _results;
      _results = [];
      for (key in config) {
        _results.push(value = config[config]);
      }
      return _results;
    };

    /*
    */

    Config.prototype._loadVars = function(vars) {
      if (typeof vars === "string") {
        vars = JSON.parse(fs.readFileSync(vars, "utf8"));
      }
      return _.extend(this.vars, vars);
    };

    return Config;

  })();

}).call(this);
