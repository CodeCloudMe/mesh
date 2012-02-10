(function() {
  var fs, outcome, parseConfig, step;

  fs = require("fs");

  step = require("stepc");

  outcome = require("outcome");

  /*
   parses the options into an executable configuration
  */

  parseConfig = function(ops, callback) {
    return console.log(ops);
  };

  /*
   loads the config
  */

  exports.load = function(file, callback) {
    var res;
    res = outcome.error(callback);
    return step.async(function() {
      return fs.readFile(file, "utf8", res.success(this));
    }, function(configStr) {
      return this(JSON.parse(configStr));
    }, function(config) {
      return parseConfig(config, callback);
    });
  };

}).call(this);
