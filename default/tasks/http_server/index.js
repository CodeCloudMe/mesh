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

function parseFileTasks(fileTasks) {
	var ft = [];
	for(var pattern in fileTasks) {
		var task = fileTasks[pattern];
		ft.push({
			tester: new RegExp(pattern),
			tasks: task instanceof Array ? task : [task]
		});
	}

	return ft;
}

function getFileTasks(ft, file) {
	var tasks = [];
	for(var i = 0, n = ft.length; i < n; i++) {
		var inf = ft[i];
		if(inf.tester.test(file)) {
			tasks = tasks.concat(inf.tasks);
		}
	}
	return tasks;
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
	taskScope = target.taskScope || publicScope,

	//tasks to run against file matches
	fileTasks = parseFileTasks(target.fileTasks || {});

	//runs a registered task
	function runTask(scope, task, target, next) {
		self.factory.commands.run([scope, task].join(":"), target, next);	
	}

	//use middleware to mesh content
	server.use(function(req, res, next) {
		var fullPath = target.directory + req.path,

		//parse anything in the query such as commas -> array
		query = parseQuery(req.query);

		//otherwise set the file up to be meshed
		var newTarget = query,
		extParts = fullPath.match(/\/[^\/]*?$/)[0].split("."),
		ext;

		if(extParts.length > 1) {
			newTarget.input = fullPath;
			ext = extParts.pop();
		} else {
			newTarget.input = fullPath + "/index.html";
			ext = "html";
		}

		query.task = query.task || getFileTasks(fileTasks, newTarget.input);


		if(!query.task) return next();

		tasks = query.task instanceof Array ? query.task : [query.task];


		
		//create a temp file consisting of a unique hash
		var output =  newTarget.output = "/tmp/" + new Buffer(req.url).toString("base64").replace(/\//g,"_") + "." + ext;


		var queue = tq.queue();

		//error? return it to the user
		var on = outcome.error(function(err) {
			res.end(String(err));
		})

		tasks.forEach(function(task) {

			queue.push(function() {
				var next = this, nextQueue = this;


				//ONLY use the fallback if the task scope doesn't
				//equal the public scope - this would be redundant.
				if(taskScope != publicScope) {
					next = function(err) {
						switch(err.errno || 0) {
							case 3: 
							return on(err);
						}

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
			// console.log("==> serve %s", fullPath);
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