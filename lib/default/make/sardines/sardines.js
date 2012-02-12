var step = require('stepc'),
async    = require('async'),
fs       = require('fs');


module.exports = function(ops, callback) {
	
	//the entry points to scan
	var entries = ops.entries,

	//the additional files to include - can be folders, or javascript files
	include		= ops.include;

	step(

		function() {
			
		}
	)

}


module.exports({ entries: ["/Users/craig/Dropbox/Developer/Jobs/Spice/private/spice.io/bootstrap.js"] });