var express = require("express"),
path        = require("path"),
fs          = require("fs"),
mkdirp      = require("mkdirp"),
step        = require("step"),
Cache       = require("./cache"),
watch_r     = require("watch_r"),
outcome     = require("outcome"),
_           = require("underscore"),
util        = require("util");

module.exports = {
	"def http_server": {
		"params": {
			"port": {
				"value": 8080
			},
			"directory": {
				"description": "path to the HTTP files",
				"value": process.cwd()
			},
			"namespace": {
				"description": "namespace to use in the browser to handle http files",
				"value": "/"
			}
		},
		"description": "makes tasks accessible from the web",
		"message": "dir=<%-directory %> port=<%-port %>",
		"run": run
	}
}

function run(target, next) {

	var port = target.get("port"),
	dir      = path.resolve(process.cwd(), target.get("directory")),
	ns       = target.get("namespace"),
	parser   = target.parser,
	cache = new Cache({ dir: "/tmp/mesh/cache" });

	// console.log(target._data)

	parser.run({
		"watch": {
			"file": dir,
			"delay": 500,
			"run": function(target, next) {
				console.log("%s has changed, purging http cache", path.relative(process.cwd(), target.get("input")));
				cache.purge();
				next();
			}
		}
	});

	cache.purge();

	var server = express.createServer();

	server.use(function(req, res, next) {
		var rpath = req.path,
		containsNs = rpath.indexOf(ns) === 0,
		hasTask    = !!req.query.task;


		if(!containsNs && !hasTask) return next();

		var fullPath  = path.normalize(dir + "/" + (containsNs ? rpath.substr(ns.length) : rpath)),
		extParts = fullPath.match(/\/[^\/]*?$/)[0].split("."),
		ext;

		//if the extension is NOT present, then default to the index file
		if(extParts.length > 1) {
			ext = extParts.pop();
		} else {
			rpath = "/index.html";
			fullPath = fullPath + rpath;
			ext = "html";
		}


		var key = new Buffer(req.url).toString("base64").replace(/\//g,"_") + "." + ext;

		//the temporary file where the mesh script is writing to
		var tmpFile = "/tmp/" + key;

		step(
			function() {
				cache.exists(key, this);
			},
			function(err) {
				if(!err) return res.sendfile(cache.path(key));
				this();
			},
			function() {

				var childData = _.defaults({ filename: path.basename(rpath), 
					input: fullPath, 
					output: tmpFile, 
					directory: dir + "/" },
					req.query);

				//the child target
				var child       = target.child(childData, false),
				tasks = childData.task ? childData.task.split(",").map(function(task) {
					return "public/" + task
				}) : [];

				next = this;

				parser.run(tasks.length ? tasks : child.get("run"), child, function(err, result) {
					if(err) {
						console.warn(err.message);
						return cache.set(key, fullPath, next);
					}

					return cache.set(key, tmpFile, next);
				});
			},
			function() {
				fs.unlink(tmpFile);
				res.sendfile(cache.path(key));
			}
		);
	});

	server.use(express.static(dir));
	server.listen(port);
	next();
}