(function() {
  var mustache;

  mustache = require("mustache");

  exports.name = "mu";

  exports.setVars = function(content, data, callback) {
    return callback(null, mustache.to_html(content, data));
  };

}).call(this);
