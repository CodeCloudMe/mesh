(function() {

  module.exports = function(buffer, ops) {
    var i, index, prop, search;
    for (prop in ops) {
      search = "$" + prop;
      index;
      i = 0;
      while ((index = buffer.indexOf(search)) > -1) {
        buffer = buffer.substr(0, index) + ops[prop] + buffer.substr(index + search.length);
      }
    }
    return buffer;
  };

}).call(this);
