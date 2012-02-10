## Write one app, deploy to MANY platforms.

### Note, I've hardly started on this - it's very much a work in progress.


## Features

- Work with a single code base.
- Seemlessly integrate backend code with front-end code (node.js).

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

You can also have the bootstrap script walk you through the process. Just add `--wizard`.

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

- params:
	- `merge` - the directory where other sources are merged to
	- `modules` - modules you want to link with the app - used in all make phases
	- `entry` - entry points into the application
	- `make` - array of build phases
		- `input` - the main entry point for this make instruction
		- `output` - the output file - variable depending on the build phase


```javascript
{
	"merge"   : "./src",
	"modules" : ["plugin.dnode"],
	"make"    : [
		{
			"input"   : "./src/index.js"
			"output"  : "./lib/index.js",
			"debug"   : ["entry", "combine"],
			"release" : ["entry", "combine", "minify"]
		}
	]
}
```







