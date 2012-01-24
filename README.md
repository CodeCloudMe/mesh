## Write one app, deploy to MANY platforms.

### Note, I've hardly started on this - it's very much a work in progress.

## Features

- Work with a single code base.
- Seemlessly integrate backend code with front-end code (node.js).

## Supports

- Web 
- Browser Extensions: **Firefox**, **Safari**, **Chrome**, **IE**, **Bookmarklets**, **Opera**
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
	"server":"http://api.yournodeserver.com",
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
	- `Makefile` - the generated makefile for your project
	- `manifest.json`
	- `icons/` - default icons
		- `icon128.png` 
		- `icon48.png`
		- `icon16.png`
	- `src` - bootstrap code is dumped here
		- `common/`
			- `your common JS files here` - stuff that gets used in all platforms
		- `node/`
			- `index.js` - entry point
			- `link.json` - tells latte what files to link with this project on build
		- `web/`
		- `firefox/`
		- `safari/`
		- `firefox-6 firefox-7 firefox-8/` -  Common libraries specific to given platforms

		- ...
	- `release/` - build directory
		- `node/`
		- `web/`
		- `firefox/`
		- `safari/`
		
After you're done initializing your project, you can go ahead and build it:

	latte build [path to project] [output directory=release]


## Linking

`link.json` is the file which tells Latte how to build your application. 

- params:
	- `plugins` - cross-referenced libraries in other apps
	- `build` - what builder to use: firefox, chrome, web? 

```javascript
{
	"plugins": ["built-in-plugin", "platform/plugin", "platform/*"],
	"build": "builder"
}
```

Here's a real use case for a Firefox plugin:

```javascript
{
	"plugins": ["common/*", "firefox/*","*"],
	"build": "firefox"
}
```

The example above would load common javascript plugins, along with common firefox specific plugins. 

Here's another one for the web:

```javascript
{
	"plugins": ["common/*","*"],
	"build": "sardines"
}
```


## Commands

TODO






