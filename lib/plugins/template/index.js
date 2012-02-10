(function() {
  var ejs, findit, fs, utils, _;

  findit = require("findit");

  ejs = require("ejs");

  fs = require("fs");

  utils = require("./utils");

  _ = require("underscore");

  exports.plugin = function(router, params) {
    /*
    */    return router.on({
      /*
      		 recusively fills template files with data provided
      */
      "pull fill/templates": function(req, res, mw) {
        var data, output;
        output = mw.data('output');
        data = _.defaults(mw.data(), {
          defaultPlatform: "node"
        });
        return utils.findAndFillTemplates(output, data, res.success(function() {
          if (!mw.next()) return res.end(true);
        }));
      }
    });
  };

}).call(this);
