/*

Branstorm...

bootstrap:

1. copy platform/bootstrap/ files over to project directory in src/
2. add additional common libraries to all copied platform link.json - dump in src/[platform]/link.json
	- internals allow for the ability to combine bootstrap code - hence copying common lib works nicely.

build:

1. Load manifest file.
2. Copy files top intermediate directory.
3. pass manifest, input, and output to builder.
3. queue up build phases. link build is default.
4. has next build phase? go to #2
5. done.


link build:

1. scan plugins in link.json - prepend platform/ if it doesn't exist
2. with plugins, scan src directory for plugins to include
3. scan built-in plugins - if used in #2, skip
4. copy found plugins into release/linked_plugins/[platform]
5. write code to scan /linked_plugins/* /*
6. build code into universal code (node.js)


*/

module.exports = require('haba').
loader().
factory(function(mod) {
	return mod;	
}).
require(__dirname + '/commands').methods;
