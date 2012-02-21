(function() {
  var async, merge, path;

  path = require("path");

  merge = require("./merge");

  async = require("async");

  exports.plugin = function(router, params) {
    var moduleDirs;
    moduleDirs = [params.modulesDir];
    return router.on({
      /*
      		 Merges two directories together
      */
      "pull merge": function(req, res, mw) {
        var input, platform;
        input = mw.data('input');
        platform = mw.data('platform');
        return merge({
          input: input,
          platform: platform,
          router: router
        }, res.success(function(result) {
          req.sanitized.intermediate = result.output;
          if (!mw.next()) return res.end(result);
        }));
      },
      /*
      */
      "push module/dir": function(dir) {
        return moduleDirs.push(dir);
      }
    });
  };

}).call(this);
