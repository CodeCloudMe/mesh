var dnode = require('dnode');


exports.plugin = function(ops, params) {
	
	var server, haba = this;


	//loads the session plugins for the given user
	function loadSession(profile, callback) {
		
		var pluginLoader = haba.loader();

		pluginLoader.
		options({ profile: profile }, true).
		require(params.sessionPluginsDir).
		init(function() {

			callback(pluginLoader.methods);

		})

	}


	var self = {

		/**
		 * on init, startup the dnode sever
		 */

		init: function() {
			
			server = dnode({

				//if there's a connection, the user must authorize before continuing.
				hook: self.hook
			});

		},

		/**
		 * hooks the user into the app. The returned hooks
		 * maybe variable depending on the type of profile & level of permissions
		 * given to the user
		 */

		hook: function(credentials, callback) {

			//call to the auth plugin, and authorize
			self.plugin('auth').authorize(credentials, function(err, profile) {
				
				//error? return it - most likely not authorized.
				if(err) return callback(err);

				loadSession(function(remote) {

					//user is authorized, return 
					callback(null, {
						profile: profile,
						remote: remote	
					});	

				});
				

			});

		}
	};

	return self;
}