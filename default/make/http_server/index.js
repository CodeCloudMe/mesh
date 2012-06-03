var express = require("express");

exports.params = {
	'directory': true
};

exports.run = function(target, next) {
	var server = express.createServer();
	server.use(express.static(target.directory));	
	server.listen(target.port || 8080);
	next();
}

exports.taskMessage = function(target) {
	return "run http server dir=" + target.directory + " port=" + target.port; 
}