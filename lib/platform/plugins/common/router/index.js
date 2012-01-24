var beanpoll = require('beanpoll');

exports.plugin = function(plugins) {
	

	return {
		
		init: function() {
			
			plugins.emit('router', beanpoll.router();
		}

		/*

		router: require('routes')
		
		*/

	}
}