(function() {
  var findit, fs, handlebars, outcome;

  fs = require("fs");

  findit = require("findit");

  outcome = require("outcome");

  handlebars = require("handlebars");

  /*
  */

  exports.findAndFillTemplates = function(directory, data, callback) {
    var find, tplFiles,
      _this = this;
    find = findit(directory);
    tplFiles = [];
    find.on("file", function(file) {
      if (!/\.hb/.test(file)) return;
      return tplFiles.push(file);
    });
    return find.on("end", function() {
      return exports.fillTemplates(tplFiles, data, callback);
    });
  };

  /*
  */

  exports.fillTemplates = function(tplFiles, data, callback) {
    var file, onResult;
    if (!tplFiles.length) return callback();
    onResult = outcome.error(callback);
    file = tplFiles.shift();
    return exports.fillTemplate(file, data, onResult.success(function() {
      return exports.fillTemplates(tplFiles, data, callback);
    }));
  };

  /*
  */

  exports.fillTemplate = function(tplFile, data, callback) {
    var onResult;
    onResult = outcome.error(callback);
    return fs.readFile(tplFile, "utf8", onResult.success(function(content) {
      var tpl;
      tpl = handlebars.compile(content)(data);
      return fs.writeFile(tplFile.replace('.hb', ''), tpl, onResult.success(function() {
        return fs.unlink(tplFile, callback);
      }));
    }));
  };

}).call(this);
