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
	- `mesh.json` - tells mesh how to build your project
	- `src/` - bootstrap code is dumped here
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
	- `src` - javascript sources
	- `lib` - javascript library directory
	- `modules` - modules you want to link with the app
	- `entry` - entry points into the application
	- `make` - the build phase for the given platform

```javascript
{
	"src": "./src",
	"lib": "./lib"
	"modules": ["plugin.dnode"],
	"entry": ["./index.js"]
	"make": ["entry","browserify","firefox"]
}
```







