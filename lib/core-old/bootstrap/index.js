(function() {
  var BaseOperation, Bootstrap, DirMerge, FindFiles, TplVars, ncp,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  BaseOperation = require("../base/Operation");

  DirMerge = require("./DirMerge");

  FindFiles = require("./FindFiles");

  TplVars = require("./TplVars");

  ncp = require("ncp");

  /*
  steps:
  
  1. merge the target bootstrap platforms into an intermediate file
  2. find the template variables in the bootstrap files
  3. run the template variables through a factory, whether interactive, or otherwise...
  4. fill the template vars
  */

  module.exports = Bootstrap = (function(_super) {

    __extends(Bootstrap, _super);

    /*
    	 Constructor
    	 @param input the input directory which contains the bootstrap code
    	 @param output the output directory for out bootstrap code
    	 @param tplFactory the template factory for finding variables
    	 @param walkTplVars the function which walks through the template vars and gives us 
    	 stuff to data in our templates
    	 @param include the platforms we want to include ~ node, web, node+web
    */

    function Bootstrap(input, output, tplFactory, getTplData, include) {
      this.input = input;
      this.output = output;
      this.tplFactory = tplFactory;
      this.getTplData = getTplData;
      this.include = include;
      this.intermDir = "" + output + "-interm";
      Bootstrap.__super__.constructor.call(this);
    }

    /*
    */

    Bootstrap.prototype.start = function() {
      return DirMerge.start({
        input: this.input,
        output: this.intermDir,
        include: this.include
      }, this._onSuccess(this._onIntermDirMerge));
    };

    /*
    */

    Bootstrap.prototype._onIntermDirMerge = function() {
      return FindFiles.start({
        dir: this.intermDir,
        test: this.tplFactory.test
      }, this._onSuccess(this._onTplFiles));
    };

    /*
    */

    Bootstrap.prototype._onTplFiles = function(files) {
      this._tplFiles = files;
      return this.getTplData(this._onSuccess(this._onTplData));
    };

    /*
    */

    Bootstrap.prototype._onTplData = function(data) {
      return TplVars.set({
        files: this._tplFiles,
        tplFactory: this.tplFactory,
        data: data
      }, this._onSuccess(this._onWriteTplData));
    };

    /*
    */

    Bootstrap.prototype._onWriteTplData = function() {
      return DirMerge.start({
        input: this.input,
        output: this.output,
        include: this.include
      }, this._onSuccess(this._onWriteOutput));
    };

    /*
    */

    Bootstrap.prototype._onWriteOutput = function() {
      return this._end();
    };

    return Bootstrap;

  })(BaseOperation);

  module.exports.start = function(ops, callback) {
    return new Bootstrap(ops.input, ops.output, ops.tplFactory, ops.walkTplVars, ops.include).onComplete(callback).start();
  };

}).call(this);
