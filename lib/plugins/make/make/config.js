(function() {
  var BuilderFactory, Builders, Config, MakeTargets, Phases, fs, outcome, path, step;

  BuilderFactory = require("./factory");

  Builders = require("./builders");

  MakeTargets = require("./targets");

  Phases = require("./phases");

  step = require("stepc");

  fs = require("fs");

  path = require("path");

  outcome = require("outcome");

  /* 
   the mesh config value object
  
   Example config:
  
  
   {
   	
   	builders: {
   		firefox: {
   			script: "./compile-firefox.js"
   		}
   	},
  
   	build: {
   		js: {
   			debug: ["firefox"]
   		}
   	},
  
   	target: [
   		{
   			input: "./script.js",
   			output: "./script.out.js",
   			build: "js"
   		},
   		{
   			input: "./script2.js",
   			output: "./script2.out.js",
   			build: {
   				"release": ["combine","minify"]
   			}
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
      this.buildPhases = new Phases(this.buildFactory);
      this.targets = new MakeTargets(this.buildPhases);
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
      if (config.builders) this.builders.load(config.builders);
      if (config.build) this.buildPhases.load(config.build);
      if (config.targets) return this.targets.load(config.targets);
    };

    return Config;

  })();

}).call(this);
