module.exports = function(req, res, next) {
	
	return next();


	//TODO = check agent
	req.headers['content-type'] = 'text/html';
	req.url = req.url.replace(/[^\?]+/,'/');
	next();
}