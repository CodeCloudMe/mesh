(function() {

  exports.plugin = function(router, params) {
    /*
    */    return router.on({
      /*
      		 recusively fills template files with data provided
      */
      "pull v/output": function(req, res, mw) {
        var output;
        output = mw.data("output");
        if (!output) return res.end(new Error("output is not present"));
        req.sanitized.output = output;
        return mw.next();
      }
    });
  };

}).call(this);
