var connect = require('connect'),
path        = require('path');

exports.plugin = function(router) {

	var platformDir = path.normalize(__dirname + '/../../../web');

	console.log(platformDir)
	

	var srv = connect.createServer();
	
	srv.use(connect.static(platformDir));
	srv.use(require('./checkAgent'));
	srv.use(require('./beanpoll')(router));
	srv.use(connect.static(platformDir));


	srv.listen(8005);
}