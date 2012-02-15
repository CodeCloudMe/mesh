## Cross-Platform JavaScript Build System

## Motivation

- Ability to use the same libraries, same API's across multiple platforms without refactoring code.
- Some standardization for writing javascript-based apps (commonjs).
- Keeps platform-specific code separate from core implementation (common library).
- Flexible enough to customize build processes. 
- Ability to be very specific about a platform, e.g., `mesh make web:ie:6`, `mesh make web:firefox:7`
- Seamlessly communicate between two different javascript apps, e.g., web + node.
- To other really cool stuff, e.g., serving single-page apps and static websites from the same code.

## Supports

- Web 
- Node.js

## Soon

- Browser Extensions: **Firefox**, **Safari**, **Chrome**, **IE**, **Opera**, **Bookmarklets**
- Soon: Titanium, Phonegap


## Prerequisites

- [Node.js](http://nodejs.org/) (needed for CLI)

## Basic Setup
	
We'll first kick things off by initializing our project. Call:

	mesh bootstrap [platforms]

Here's an example:

	mesh bootstrap web+node+chrome+firefox

The bootstrap script will produce some boilerplate code. 
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








