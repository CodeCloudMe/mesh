var haba = require('haba');


exports.plugin = function(ops, params) {
	
	return {
		init: function() {
			
		},
		newSession: function(client) {

			//TODO - authorize
			
			var loader = haba.loader();

			loader.require(params.sessionPluginsDir).
			init(function() {

				//connect the server with the client
				client.connect(loader.methods);

			});
		}
	}
}