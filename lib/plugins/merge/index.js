(function() {
  var async, merge, path;

  merge = require("./merge");

  async = require("async");

  path = require("path");

  exports.plugin = function(router, params) {
    var moduleDirs;
    moduleDirs = [params.modulesDir];
    return router.on({
      /*
      		 Merges two directories together
      */
      "pull merge": function(req, res, mw) {
        var input, output, platform;
        output = mw.data('output');
        input = mw.data('input');
        platform = mw.data('platform');
        return merge({
          input: input,
          platform: platform,
          router: router
        }, res.success(function() {
          return res.end(true);
        }));
      },
      /*
      */
      "pull find/module/dir": function(req, res) {
        var allModuleDirs, dir, module, possibilities, _i, _len;
        module = req.query.module;
        allModuleDirs = moduleDirs.concat(req.query.dirs || []);
        possibilities = [];
        for (_i = 0, _len = allModuleDirs.length; _i < _len; _i++) {
          dir = allModuleDirs[_i];
          possibilities.push("" + dir + "/" + module);
        }
        return async.filter(possibilities, path.exists, function(results) {
          if (!results.length) {
            return res.error(new Error("module \"" + module + "\" does not exist"));
          }
          return res.end(results.shift());
        });
      },
      /*
      */
      "push module/dir": function(dir) {
        return moduleDirs.push(dir);
      }
    });
  };

}).call(this);