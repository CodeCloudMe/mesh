var express = require("express"),
sardines = require("sardines");

exports.params = {
	'directory': true
};

exports.run = function(target, next) {
	var server = express.createServer();
	server.use(sardines.middleware(target));
	server.listen(target.port || 8080);
	next();
}

exports.taskMessage = function(target) {
	return "run http server dir=" + target.directory + " port=" + target.port; 
}