## Write one app, deploy to MANY platforms.

### Note, I've hardly started on this - it's very much a work in progress.


## Features

- Work with a single code base.
- Seemlessly integrate between other platforms (front-end / backend).

## Supports

- Web 
- Browser Extensions: **Firefox**, **Safari**, **Chrome**, **IE**, **Opera**, **Bookmarklets**
- Server Side: **Node**
- Soon: Titanium, Phonegap


## Prerequisites

- [Node.js](http://nodejs.org/) (needed for CLI)

## Basic Setup
	
We'll first kick things off by initializing our project. Call:

	mesh bootstrap [platforms]

Here's an example:

	mesh bootstrap web+node+chrome+firefox

The bootstrap script will produce some boilerplate code. Here's what it consists of:


- `project/path/`
	- `makefile` - makes each app - just call `make node`, `make iphone`, etc.
	- `package.json` - Info about your project
	- `src/` - boilerplate code is dumped here
		- `common/`
			- `your common JS files here` - stuff that gets used in all platforms
		- `node/`
			- `index.js` - entry point
			- `mesh.json` - tells mesh how to merge this platform
		- `web/`
		- `firefox/`
		- `safari/`
		
After you're done initializing your project, you can go ahead and make it:

```
	mesh make [platform]
```

## Meshing Libraries Together

`mesh.json` is the file which tells Mesh how to build your application. 


Some psuedocode for a chrome extension:

```javascript
{
	"merge"   : "./src",
	"modules" : ["plugin.dnode"],
	"build"  : {
		"web:debug": ["combine"],
		"web:release": ["web:debug", "minify"]
	},
	"targets": [
		{
			"input"     : "./src/background/index.js",
			"output"    : "./lib/background/index.js",
			"modules"   : ["plugin.background"],
			"build"     : "web:*"
		},
		{
			"input"     : "./src/foreground/index.js",
			"output"    : "./lib/foreground/index.js",
			"modules"   : ["plugin.foreground"],
			"build"     : "web:*"
		},
		{
			"input"   : "./manifest.json",
			"output"  : "./bin/ext.zip",
			"build"   : "compile-chrome"
		} 
	]
}
```








