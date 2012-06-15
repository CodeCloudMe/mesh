var structr = require("structr"),
fs = require("fs"),
exec = require("child_process").exec,
mkdirp = require("mkdirp"),
util   = require("util");


module.exports = structr({

	/**
	 */

	"__construct": function(ops) {
		this._dir = ops.dir;
		this._load();
	},

	/**
	 */

	"step exists": function(key, callback) {
		fs.lstat(this.path(key), callback);
	},

	/**
	 */

	 "step set": function(key, path, callback) {
	 	util.pump(fs.createReadStream(path), fs.createWriteStream(this.path(key)), callback);
	 },

	/**
	 */


	"step purge": function(next) {
		exec("rm -rf " + this._dir + "; mkdir -p " + this._dir, next);
	},

	/**
	 */


	"step _load": function(next) {
		mkdirp(this._dir, next);
	},

	/**
	 */

	"path": function(key) {
		return this._dir + "/" + key;
	}
})