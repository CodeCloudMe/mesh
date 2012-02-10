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
      "make": {
        "dir": __dirname + "/platform/make"
      }
    }).require(__dirname + "/plugins").load(function() {
      if (callback) return callback(null, router);
    });
  };

}).call(this);
