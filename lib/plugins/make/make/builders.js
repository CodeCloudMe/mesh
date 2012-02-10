
/*
 collection of builders loaded from configurations
*/

(function() {
  var Builders;

  module.exports = Builders = (function() {
    /*
    */
    function Builders(factory) {
      this.factory = factory;
      this._builders = {};
    }

    /*
    */

    Builders.prototype.load = function(builders) {
      var builderName, _results;
      _results = [];
      for (builderName in builders) {
        _results.push(this.add(builderName, this.factory.newBuilder(builderName, builders[builderName])));
      }
      return _results;
    };

    /*
    */

    Builders.prototype.get = function(name) {
      return this._builders[name];
    };

    /*
    */

    Builders.prototype.add = function(builder) {
      return this._builders[builder.name] = builder;
    };

    return Builders;

  })();

}).call(this);
