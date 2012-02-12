(function() {
  var BuilderFactory, Builders, Config, MakeTargets, Modules, fs, outcome, path, step;

  fs = require("fs");

  path = require("path");

  step = require("stepc");

  outcome = require("outcome");

  Builders = require("./builders");

  MakeTargets = require("./targets");

  BuilderFactory = require("./factory");

  Modules = require("./modules");

  /* 
   the mesh config value object
  
   Example config:
  
  
   {
   	
  
   	build: {
   		"web:debug": ["sardines"],
   		"web:release": ["web:debug", "minify"]
   	},
  
   	target: [
   		{
   			input: "./script.js",
   			output: "./script.out.js",
   			build: "web:*"
   		},
   		{
   			input: "./script2.js",
   			output: "./script2.out.js",
   			build: "web:*"
   		}
   	]
   }
  */

  module.exports = Config = (function() {
    /*
    */
    function Config() {
      this.buildFactory = new BuilderFactory(this);
      this.builders = new Builders(this.buildFactory);
      this.targets = new MakeTargets(this.builders);
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
      if (config.build) this.builders.load(config.build);
      if (config.targets) return this.targets.load(config.targets, this.cwd);
    };

    return Config;

  })();

}).call(this);
