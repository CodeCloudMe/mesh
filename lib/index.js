(function() {
  var beanie;

  beanie = require("beanie");

  exports.load = function(callback) {
    var loader;
    loader = beanie.loader();
    return loader.params({
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
      loader.router.push("init");
      if (callback) return callback(null, loader.router);
    });
  };

}).call(this);
