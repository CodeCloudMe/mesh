(function() {
  var BaseBuilder, SearchBuilder, async, handlebars, outcome, structr, walkr,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  async = require("async");

  BaseBuilder = require("./base").Builder;

  handlebars = require("handlebars");

  walkr = require("walkr");

  structr = require("structr");

  outcome = require("outcome");

  /*
   the ENTRY point into the build system
  */

  module.exports = SearchBuilder = (function(_super) {

    __extends(SearchBuilder, _super);

    function SearchBuilder() {
      SearchBuilder.__super__.constructor.apply(this, arguments);
    }

    /*
    */

    SearchBuilder.prototype.load = function(options) {
      var builders, search, _results;
      this.dir = options.directory;
      builders = this.findBuilders = [];
      _results = [];
      for (search in options.find) {
        _results.push(builders.push({
          search: new RegExp(search),
          builder: this.builders.factory.newBuilder(search, options.find[search])
        }));
      }
      return _results;
    };

    /*
    	 passes the build phase
    */

    SearchBuilder.prototype._start = function(target, callback) {
      var _this = this;
      return walkr(this.dir).filter(function(options, next) {
        var filt, _i, _len, _ref;
        _ref = _this.findBuilders;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          filt = _ref[_i];
          if (filt.search.test(options.source)) {
            return filt.builder.start(structr.copy(target, {
              file: options.source
            }), callback.success(function() {
              return next();
            }));
          }
        }
        return next();
      }).start(callback);
    };

    /*
    */

    SearchBuilder.prototype._printMessage = function() {};

    return SearchBuilder;

  })(BaseBuilder);

  module.exports.test = function(config) {
    return !!config.directory && !!config.find;
  };

}).call(this);
