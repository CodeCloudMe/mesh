var step = require('stepc'),
fs       = require('fs'),
minify   = require('html-minifier').minify,
_        = require('underscore'),
outcome  = require("outcome");


//adds the buildId to all dependencies. This ensures new files
//are *always* served to the client

module.exports = {
	"def minify_html OR public/minify_html": {
		"params": {
			"input": true,
			"output": true
		},
		"run": run
	}
}

function run(target, next) {


	var ops = target.data,
	on = outcome.error(next);


	function _minify(content) {


		function canRemoveWhitespace(tag, attrs) {

			if(tag != 'script') return false;


			for(var i = attrs.length; i--;) {

				var attr = attrs[i];

				if(attr.name == 'type' && attr.value.match(/text\/x-tmpl-\w+/)) {
					
					return true;

				} 

			}

			return false;
		}

		return minify(content,  _.defaults(ops, {
			removeEmptyElements: false,
			removeAttributeQuotes: false,
			collapseBooleanAttributes: false,
			removeCDATASectionsFromCDATA: false,
			removeCommentsFromCDATA: false,
			removeEmptyAttributes: true,
			collapseWhitespace: true,
			removeComments: true,
			canTrimWhitespace: canRemoveWhitespace,
			canCollapseWhitespace: canRemoveWhitespace
		}));

	}



	step(

		/**
		 */

		function() {
			fs.readFile(ops.input, "utf8", this)
		},

		/**
		 */

		on.success(function(content) {


			minified = _minify(content);

			this(null, minified)
		}),


		/**
		 */

		 on.success(function(content) {

		 	fs.writeFile(ops.output, content, this);

		 }),

		 /**
		  */

		 next

	);
}