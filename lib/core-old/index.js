(function() {
  var bootstrap, merge;

  merge = require("./operations/DirMerge").start;

  bootstrap = require("./bootstrap");

  /*
  
  1. bootstrap
  2. merge platform
  3. make
  */

  /*
   This starts the project off with the basics required
   for mesh to operate on the next steps: merge & make
  */

  exports.bootstrap = function(ops, callback) {};

  /*
   this merges the projects together for a target framework
  */

  exports.merge = merge;

  /* 
   this makes a project for a target platform
  */

  exports.make = function(ops, callback) {};

  /*
   Uses a module for the build processes: bootstrap, and make
  */

  exports.use = function(module) {
    if (module.bootstrap) return bootstrap.add(module.bootstrap);
  };

}).call(this);
