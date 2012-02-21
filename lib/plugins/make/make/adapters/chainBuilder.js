(function() {
  var BaseBuilder, ChainBuilder, outcome, seq,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  seq = require("seq");

  BaseBuilder = require("./base").Builder;

  outcome = require("outcome");

  /*
   a chain of builders
  
   Example:
  
   "firefox":["combine","compile-firefox"]
  */

  module.exports = ChainBuilder = (function(_super) {

    __extends(ChainBuilder, _super);

    function ChainBuilder() {
      ChainBuilder.__super__.constructor.apply(this, arguments);
    }

    /*
    */

    ChainBuilder.prototype.load = function(chains) {
      var builder, _i, _len, _results;
      this.chains = [];
      _results = [];
      for (_i = 0, _len = chains.length; _i < _len; _i++) {
        builder = chains[_i];
        _results.push(this.chains.push(this.builders.factory.newBuilder(null, builder)));
      }
      return _results;
    };

    /*
    */

    ChainBuilder.prototype._start = function(input, callback) {
      var self;
      self = this;
      return seq(this.chains).seqEach(function(chain, next) {
        return chain.start(input, outcome.callback(this));
      }).seq(function() {
        return callback();
      });
    };

    return ChainBuilder;

  })(BaseBuilder);

  module.exports.test = function(config) {
    return config instanceof Array;
  };

}).call(this);
