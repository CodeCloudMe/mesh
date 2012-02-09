(function() {

  module.exports = function(router, params) {
    /*
    */    return router.on({
      /*
      		 recusively fills template files with data provided
      */
      "pull fill/templates": function(req, res, mw) {
        var output;
        output = mw.data('output');
        console.log("filling templates");
        return mw.next();
      }
    });
  };

}).call(this);
