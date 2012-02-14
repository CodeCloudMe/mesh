(function() {
  var beanpoll, haba;

  haba = require("haba");

  beanpoll = require("beanpoll");

  exports.load = function(callback) {
    var pluginLoader, router;
    router = beanpoll.router();
    pluginLoader = haba.loader();
    return pluginLoader.options(router).params({
      "bootstrap": {
        "dir": __dirname + "/../default/bootstrap"
      },
      "merge": {
        "modulesDir": __dirname + "/../default/modules"
      },
      "make": {
        "configPath": __dirname + "/../default/mesh.json"
      }
    }).require(__dirname + "/plugins").load(function() {
      router.push("init");
      if (callback) return callback(null, router);
    });
  };

}).call(this);
