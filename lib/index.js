(function() {
  var haba;

  haba = require("haba");

  exports.load = function() {
    var pluginLoader;
    pluginLoader = haba.loader();
    return pluginLoader.params({
      "cmd.bootstrap": {
        "dir": __dirname + "/platform/bootstrap"
      },
      "cmd.make": {
        "dir": __dirname + "/platform/make"
      }
    }).require(__dirname + "/plugins").load();
  };

  exports.load();

}).call(this);
