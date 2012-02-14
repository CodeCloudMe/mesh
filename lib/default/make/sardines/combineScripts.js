var parseFile    = require('./tpl/parser').parseFile,
async            = require('async'),
step             = require('step'),
fs               = require('fs'),
outcome          = require('outcome'),
getPkgName 		 = require('./utils').getPackageName;

/**
 * takes a list of scripts, and combines them into one using a given template
 */


 module.exports = function(ops, callback) {
 		
 	//entry points into the given script
 	var entries = ops.entries || [],

 	//scripts to include
 	include     = ops.include;


 	var on = outcome.error(callback);


 	step(
 		function() {
 			
 			async.map(include, getModuleTplBuffer, this);

 		},
 		on.success(function(modules) {

 			// this(null, parseFile({}))
 			
 			var buffer = fs.readFileSync(__dirname + "/tpl/main.tpl.js") + "\n\n";

 			buffer += modules.join("\n") + "\n";

 			buffer += parseFile({ entries: stringifyEntries(entries) }, __dirname + "/tpl/entry.tpl.js") + "\n";


 			this(null, parseFile({ body: buffer, name: '__app'}, __dirname + "/tpl/body.tpl.js"));
 		}),
 		callback
 	)

 }


function stringifyEntries(entries) {
	var buffer = [];

	for(var i = entries.length; i--;) {
		buffer.push("\"entries\"");
	}

	return "[" + buffer.join(",") + "]";
}



 function getModuleTplBuffer(script, callback) {
 	
 	var on = outcome.error(callback);

 	step(
 		function() {
 			if(!script) return callback(null);
 			
 			fs.readFile(script.path, "utf8", this);
 		},
 		on.success(function(content) {

 			var path = script.pathFromPkg.replace('.','module/' + (script.moduleName));

 			this(null, parseFile({ path: path, content: content}, __dirname + '/tpl/module.tpl.js'))	
 		}),
 		
 		callback


 	);
 }