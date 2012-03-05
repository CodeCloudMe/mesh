var step  = require('stepc'),
mergeDirs = require('../merge/mergeDirs'),
walkr     = require('walkr'),
sprintf   = require('sprintf').sprintf;

exports.validate = {
	'directories:bootstrap': true,
	'platforms': /(\w+\+?)+/,
	'cwd': true
};


exports.run = function(ops, next) {


	var output    = ops.cwd,
	// platforms = ops.platforms = ops.platforms.split('+'),
	bootstrapDir  = ops.directories.bootstrap;
	// bootstrapSrcDir = bootstrapDir + "/src";


	step(

		/**
		 */

		/*function() {

			mergeDirs(bootstrapSrcDir, platforms).
			filterFile(mergeDirs.parseTemplate(ops)).
			copyEach(output + "/src").
			complete(this);

		},*/

		/**
		 */

		function() {

			walkr(bootstrapDir, output).
			/*filter(function(options, next) {
				next(options.source == bootstrapDir || !options.stat.isDirectory())
			}).*/
			filterFile(walkr.parseTemplate(ops)).
			filter(walkr.copy).
			start(this);

		},

		/**
		 */

		next
	);
};


exports.taskMessage = function(target) {
	return "bootstrap cwd";
	// return sprintf("bootstrap \"%s\"", target.platforms.replace(/\+/g,', '));

}