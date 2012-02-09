(function() {
  var beanpoll;

  beanpoll = require("beanpoll");

  exports.plugin = function() {
    var router,
      _this = this;
    router = beanpoll.router();
    return {
      init: function() {
        var plugin, _i, _len, _ref;
        _ref = _this.plugins(/.*/);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          plugin = _ref[_i];
          if (plugin.routes) plugin.routes(router, _this.params(plugin.name));
        }
        return router.request("bootstrap").query({
          output: '/Users/craig/Desktop/test',
          platforms: ['node', 'web']
        }).error(function(err) {
          return console.log(err);
        }).pull();
      }
    };
  };

}).call(this);
