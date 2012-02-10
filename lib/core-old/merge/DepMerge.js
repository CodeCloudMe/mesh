(function() {
  var DepMerge, DirMerge,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  DirMerge = require("./DirMerge");

  module.exports = DepMerge = (function(_super) {

    __extends(DepMerge, _super);

    function DepMerge() {
      DepMerge.__super__.constructor.apply(this, arguments);
    }

    /*
    */

    DepMerge.prototype._onDirsMerged = function() {};

    return DepMerge;

  })(DirMerge);

}).call(this);
