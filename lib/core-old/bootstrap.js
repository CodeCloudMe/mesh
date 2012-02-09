(function() {
  var Bootstrap, templateFactory;

  Bootstrap = require("../middleware/Hook");

  templateFactory = require("./template");

  module.exports = function(ops, callback) {
    var bs;
    return bs = new Bootstrap(ops.input, ops.output, template);
  };

}).call(this);
