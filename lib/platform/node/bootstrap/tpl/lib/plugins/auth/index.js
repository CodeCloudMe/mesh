exports.plugin = function(ops) {
	
	return {
		
		authorize: function(credits, callback) {
			
			//TODO - add middleware here. Return true for now.
			callback(null);//	
		}	
	};

}