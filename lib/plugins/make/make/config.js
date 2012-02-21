(function() {
  var Builders, Config, fs, outcome, path, step, traverse;

  fs = require("fs");

  path = require("path");

  step = require("stepc");

  outcome = require("outcome");

  Builders = require("./builders");

  traverse = require("traverse");

  /* 
   the mesh config value object
  */

  module.exports = Config = (function() {
    /*
    */
    function Config() {
      this.builders = new Builders;
      this.tasks = new Builders(this.builders);
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
      if (config.tasks) return this.tasks.load(config.tasks);
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

    return Config;

  })();

}).call(this);
