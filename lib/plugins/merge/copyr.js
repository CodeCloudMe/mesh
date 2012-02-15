(function() {
  var async, copyDir, copyFile, copyFile2, copyMergeable, copyr, fs, mkdirp, outcome, path, rmdirr, step, _;

  _ = require("underscore");

  fs = require("fs");

  step = require("stepc");

  path = require("path");

  async = require("async");

  mkdirp = require("mkdirp");

  rmdirr = require("rmdirr");

  outcome = require("outcome");

  /*
  */

  copyMergeable = function(input, output, next) {
    output = output.replace(".merge", "");
    return step.async(function() {
      return path.exists(output, this);
    }, function(outExists) {
      var icfg, ocfg, ofg;
      ocfg = outExists ? JSON.parse(fs.readFileSync(output, "utf8")) : {};
      icfg = JSON.parse(fs.readFileSync(input, "utf8"));
      ofg = _.extend(ocfg, icfg);
      fs.writeFileSync(output, JSON.stringify(ofg, null, 2));
      return next();
    });
  };

  /*
  */

  copyFile2 = function(input, output, next) {
    var readStream, writeStream;
    readStream = fs.createReadStream(input);
    writeStream = fs.createWriteStream(output);
    readStream.pipe(writeStream);
    return readStream.once('end', next);
  };

  /*
  */

  copyFile = function(input, output, next) {
    if (input.match(/\.merge\.json/)) return copyMergeable(input, output, next);
    return copyFile2(input, output, next);
  };

  copyDir = function(input, output, next) {
    var res;
    res = outcome.error(next);
    return step.async(function() {
      return mkdirp(output, 0777, this);
    }, function() {
      return fs.readdir(input, this);
    }, res.success(function(files) {
      return async.forEach(files, function(file, next) {
        var ifile, ofile;
        ifile = "" + input + "/" + file;
        ofile = "" + output + "/" + file;
        return copyr(ifile, ofile, next);
      }, next);
    }));
  };

  /*
  */

  copyr = function(input, output, next) {
    var res;
    res = outcome.error(function() {
      return next(new Error("" + input + " does not exist"));
    });
    return fs.lstat(input, res.success(function(stat) {
      if (stat.isDirectory()) return copyDir(input, output, next);
      return copyFile(input, output, next);
    }));
  };

}).call(this);
