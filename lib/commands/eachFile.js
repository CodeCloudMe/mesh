// Generated by CoffeeScript 1.6.2
(function() {
  var fs, glob, _getFiles, _watch;

  fs = require("fs");

  glob = require("glob");

  /*
  eachFile:
    input: /dir
    run:
      copy:
        output:
  */


  module.exports = {
    "def eachFile": {
      "params": {
        "watch": {
          "description": "watches the files"
        }
      },
      "run": {
        "each": {
          "as": "input",
          "source": function(context, next) {
            var cwd, run, watch;

            run = context.get("run");
            cwd = context.get("cwd") || process.cwd();
            watch = !!context.get("watch");
            _getFiles(context, next);
            if (watch) {
              return _watch.call(this, context);
            }
          }
        }
      }
    }
  };

  /*
  */


  _getFiles = function(context, next) {
    var cwd, input;

    cwd = context.get("cwd") || process.cwd();
    input = context.get("input");
    return glob(input, {
      cwd: cwd
    }, function(err, files) {
      files = files.map(function(file) {
        var e;

        try {
          return fs.realpathSync(cwd + "/" + file);
        } catch (_error) {
          e = _error;
          return file;
        }
      }).filter(function(file) {
        return !fs.statSync(file).isDirectory();
      });
      return next(null, files);
    });
  };

  /*
  */


  _watch = function(context) {
    var getFiles, onChange, watchFile, _watched,
      _this = this;

    _watched = [];
    onChange = function(file) {
      return _this.run(context.get("run"), context.child({
        input: file
      }));
    };
    watchFile = function(file, triggerAdded) {
      if (~_watched.indexOf(file)) {
        return;
      }
      _watched.push(file);
      if (triggerAdded) {
        onChange(file);
      }
      return fs.watchFile(file, {
        persistent: true,
        interval: 500
      }, function(cur, prev) {
        if (cur.nlink !== 0 && cur.mtime.getTime() === prev.mtime.getTime()) {
          return;
        }
        return onChange(file);
      });
    };
    getFiles = function(triggerAdded) {
      return _getFiles(context, function(err, files) {
        var file, _i, _len, _results;

        _results = [];
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          file = files[_i];
          _results.push(watchFile(file, triggerAdded));
        }
        return _results;
      });
    };
    getFiles();
    return setInterval(getFiles, 4000);
  };

}).call(this);