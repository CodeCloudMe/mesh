var step = require('stepc'),
crc32    = require('crc32'),
fs       = require('fs'),
qs       = require('querystring'),
path     = require("path"),
outcome = require("outcome");


module.exports = {
	"def run OR public/run": {
		"params": {
			"input": true,
			"output": true
		},
		"message": "<%-input %>",
		"run": run
	}
}


function run(target, next) {

	var uniqueHash = target.data.buildId,
	input = target.data.input,
	output = target.data.output,
	on = outcome.error(next);

	step(

		/**
		 */

		function() {
			fs.readFile(input, "utf8", this)
		},

		/**
		 */

		on.success(function(content) {


			//take CSS into account by looking for ()
			var urls = content.match(/('|"|\()(https?:\/\/)?\/?([^\/\n\r"']+\/)+[^\/\n\r"']+\.\w{2,3}.*?('|"|\))/g) || [];

			urls.forEach(function(url) {


				var cacheHash    = '?' + uniqueHash,
				fixedUrl;

				if(url.indexOf('?') > -1) {

					fixedUrl = url.replace('?', cacheHash + '&');

				} else {

					//take into account stuff like background-image:url(/img/)
					fixedUrl = url.replace(/(\w+\.\w{2,3})(?=(\)|"|'))/,'$1' + cacheHash);

				}


				content = content.replace(url, fixedUrl);

			});

			this(null, content)
		}),


		/**
		 */

		 on.success(function(content) {
		 	fs.writeFile(output, content, this);

		 }),

		 /**
		  */

		 next

	);
}
