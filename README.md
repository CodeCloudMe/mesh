## Write one app, deploy to MANY platforms.

## Features

- Work with a single code base.
- Seemlessly integrate backend code with front-end code (node.js).

## Supports

- Web 
- Browser Extensions: **Firefox**, **Safari**, **Chrome**, **IE**, **Bookmarklets**
- Server Side: **Node**
- Soon: Titanium, Phonegap


## Prerequisites

- [Node.js](http://nodejs.org/) (needed for CLI)

## Basic Setup
	
We'll first kick things off by initializing our project. Call:

	latte bootstrap [path to project] [types]

Here's an example:

	latte bootstrap . web node chrome firefox

You can also have the bootstrap script walk you through the process. Just add `--wizard`.

The bootstrap script will produce a `manifest.json` file. Here's what it looks like:

```javascript
{
	"name":"project-name",
	"author": "John Doe",
	"description": "project-description",
	"homepage_url": "http://somesite.com",
	"icons": {
		"128": "icons/icon128.png",
		"48": "icons/icon48.png",
		"16": "icons/icon16.png"
	},
	"dependencies": {
		"common-dep": "0.1.5"
	},
	"project_dir": "./project"
}
```

Here's the project structure:

- `project/path/`
	- `manifest.json`
	- `icons/` - default icons
		- `icon128.png` 
		- `icon48.png`
		- `icon16.png`
	- `src` - bootstrap code is dumped here
		- `common/`
			- `your common JS files here` - stuff that gets used in all platforms
		- `node/`
			- `index.js` - default entry point
		- `web/`
		- `firefox/`
		- `safari/`
		- ...
	- `release/` - build directory
		- `node/`
		- `web/`
		- `firefox/`
		- `safari/`
		
After you're done initializing your project, you can go ahead and build it:

	latte build [path to project] [output directory=release]

## Commands







