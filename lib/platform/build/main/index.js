var fs = require('fs'),
scaffoldit = require('scaffoldit');

module.exports = function(ops, next) {
	
	var entries = [];

	ops.entries.forEach(function(entry) {
		
		entries.push(fs.readFileSync(entry, 'utf8'));

		//remove the entry file since it's already included
		fs.unlink(entry);
	});

	scaffoldit({
		_src: __dirname + '/tpl/main.tpl.js',
		_dst: ops.dest + '/' + ops.mainScript,
		entries: entries.join('\n\n'),
		build: scaffoldit.fromFile,
		complete: next
	});
}