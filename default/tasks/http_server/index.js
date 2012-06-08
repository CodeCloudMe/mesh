var express = require("express"),
sardines = require("sardines"),
fs = require("fs"),
mime = require("mime"),
tq = require("tq"),
outcome = require("outcome");


exports.params = {
	// 'directory': true
};

function parseQuery(oldQuery) {
	var query = {};
	for(var prop in oldQuery) {
		var v = oldQuery[prop];
		if(~v.indexOf(",")) v = v.split(",");
		query[prop] = v;
	}
	return query;
}

exports.run = function(target, next) {
	if(!target.directory) {
		target.directory = process.cwd();
	}
	var server = express.createServer();
	server.listen(target.port || 8080);

	var self = this,

	//the default public scope
	publicScope = "public",

	//the target scope given. This is important incase
	//the scope changes from something like development, to production
	taskScope = target.taskScope || publicScope;

	//runs a registered task
	function runTask(scope, task, target, next) {
		self.factory.commands.run([scope, task].join(":"), target, next);	
	}

	//use middleware to mesh content
	server.use(function(req, res, next) {
		var fullPath = target.directory + req.path,

		//parse anything in the query such as commas -> array
		query = parseQuery(req.query);

		tasks = query.task instanceof Array ? query.task : [query.task];

		//no tasks? skip.
		if(!tasks) return next();

		//otherwise set the file up to be meshed
		var newTarget = query;
		newTarget.input = fullPath;

		//create a temp file consisting of a unique hash
		var output =  newTarget.output = "/tmp/" + new Buffer(req.url).toString("base64") + "." + mime.extension(mime.lookup(fullPath));

		
		//init the task queue
		var queue = tq.queue(),

		//error? return it to the user
		on = outcome.error(function(err) {
			res.end(String(err));
		})

		tasks.forEach(function(task) {

			queue.push(function() {
				var next = this, nextQueue = this;


				//ONLY use the fallback if the task scope doesn't
				//equal the public scope - this would be redundant.
				if(taskScope != publicScope) {
					next = function(err) {
						runTask(publicScope, task, newTarget, on.success(nextQueue));
					}
				}

				//try running the task in the current scope. If it fails, then
				//it'll move to the public domain
				runTask(taskScope, task, newTarget, on.error(next).success(nextQueue));
			})

		});

		//once all the tasks are done, send the file
		queue.push(function() {
			res.sendfile(output);
			this();
		});

		//start the tasks
		queue.start();

		
	});

	server.use(express.static(target.directory));

	next();
}

exports.taskMessage = function(target) {
	return "run http server dir=" + (target.directory || process.cwd()) + " port=" + target.port; 
}