

module.exports = (buffer, ops) ->
	
	for prop of ops
		search = "$#{prop}"
		index 
		i = 0


		while (index = buffer.indexOf(search)) > -1
			buffer = buffer.substr(0, index) + ops[prop] + buffer.substr(index + search.length)
		
	buffer

