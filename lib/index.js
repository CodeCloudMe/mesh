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
        "dir": __dirname + "/platform/bootstrap"
      },
      "merge": {
        "modulesDir": __dirname + "/platform/modules"
      },
      "make": {
        "configPath": __dirname + "/platform/make/mesh.json"
      }
    }).require(__dirname + "/plugins").load(function() {
      router.push("init");
      if (callback) return callback(null, router);
    });
  };

}).call(this);
