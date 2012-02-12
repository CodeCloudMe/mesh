(function() {
  var findit, fs, ncp, path;

  fs = require("fs");

  findit = require("findit");

  ncp = require("ncp").ncp;

  path = require("path");

  exports.plugin = function(router, params) {
    /*
    */    return router.on({
      /*
      		 finds files with regexp given
      */
      "pull find/files": function(req, res, mw) {
        var dir, find, found, search;
        search = req.query.search;
        dir = req.query.input;
        find = findit(dir);
        found = [];
        find.on("file", function(file) {
          if (search.test(file)) return found.push(file);
        });
        return find.on("end", function() {
          req.sanitized.foundFiles = found;
          if (!mw.next()) return res.end(found);
        });
      },
      /*
      		 copies found files to a new destination. Usually
      		 as an intermediate directory
      */
      "pull find/files -> copy/files": function(req, res) {
        var copyFiles, output;
        output = req.query.output;
        return copyFiles = function(files) {
          var file;
          if (!files.length) res.end(true);
          file = files.shift();
          return ncp(file, "" + output + "/path.basename file", function() {
            return copyFiles(files);
          });
        };
      }
    });
  };

}).call(this);
