var scaffoldit = require('scaffoldit');

module.exports = function(ops, callback) {
	//TODO

	var params = {};

	//wizard not present? add the default args
	if(!ops.wizard) {
		params = {
			"name": "some project",
			"description": "project description",
			"author": "John Doe"
		}		
	}

	//this will be skipped if the wizard is provided.
	scaffoldit({

		params: params,

		/**
		 * what people enter in the CLI. Again. SKIPPED if wizard isn't present.
		 */

		input: {
			"name": "(prompt) App Name:",
			"description": "(prompt) Description: ",
			"author": "Your Name:"
		},

		/**
		 * after we have everything we need, we can start building stuff
		 */

		build: function(ops, next) {

		}

	})

}