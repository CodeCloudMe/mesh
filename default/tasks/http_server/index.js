var express = require("express"),
sardines = require("sardines"),
fs = require("fs"),
mime = require("mime")

exports.params = {
	// 'directory': true
};

exports.run = function(target, next) {
	if(!target.directory) {
		target.directory = process.cwd();
	}
	var server = express.createServer();
	server.listen(target.port || 8080);

	var self = this;


	server.use(function(req, res, next) {
		var fullPath = target.directory + req.path,
		task = req.query.task;

		if(!task) return next();

		var newTarget = req.query;
		newTarget.input = fullPath;
		var output = newTarget.output = "/tmp/" + new Buffer(req.url).toString("base64") + "." + mime.extension(mime.lookup(fullPath));


		self.factory.commands.run(task, newTarget, function(err, result) {
			res.sendfile(output);
		});
	});

	server.use(express.static(target.directory));
	next();
}

exports.taskMessage = function(target) {
	return "run http server dir=" + (target.directory || process.cwd()) + " port=" + target.port; 
}