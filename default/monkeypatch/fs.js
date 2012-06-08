var fs = require("fs"),
mkdirp = require("mkdirp"),
step = require("stepc"),
util = require("util"),
path = require("path");

function tryMakingDir(to, next) {
	step(

		function() {
			path.exists(to, this);
		},
		function(exists) {
			if(exists) return this();
			mkdirp(path.dirname(to), this);
		},
		next
	);
}

fs.copyFile = function(from, to, next) {

	step(
		function() {
			tryMakingDir(to, this);
		},
		function() {
			util.pump(fs.createReadStream(from), fs.createWriteStream(to), this);
		},
		next
	);
}

var oldWriteFile = fs.writeFile;


fs.writeFile = function(to, content, next) {

	var self = this;

	step(
		function() {
			tryMakingDir(to, this);
		},
		function() {
			oldWriteFile(to, content, this);
		},
		next || function(){}
	);
}