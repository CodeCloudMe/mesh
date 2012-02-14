var connect = require('connect'),
path        = require('path');

exports.plugin = function(router, params) {


	var publicDir = (params || {}).publicDir;



	var srv = connect.createServer();
	
	if(publicDir) srv.use(connect.static(publicDir));
	srv.use(require('./checkAgent'));
	srv.use(require('./beanpoll')(router));
	if(publicDir) srv.use(connect.static(publicDir));


	srv.listen(8005);
}