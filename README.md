## Cross-Platform JavaScript Build System


## Motivation

- Ability to use the same libraries, same API's across multiple platforms without refactoring code.
- Some standardization for writing javascript-based apps (commonjs).
- Keeps platform-specific code separate from core implementation (common library).
- Flexible enough to customize build processes. 
- Ability to be very specific about a platform, e.g., `mesh make web:ie:6`, `mesh make web:firefox:7`
- Seamlessly communicate between two different javascript apps, e.g., web + node.
- To do other really cool stuff, e.g., serving single-page apps and static websites from the same code.

## Supports

- Web 
- Node.js

## Soon

- Browser Extensions: **Firefox**, **Safari**, **Chrome**, **IE**, **Opera**, **Bookmarklets**
- Soon: Titanium, Phonegap

## Projects Using Mesh.js

- [daisy](/crcn/daisy) - Cross-platform mq for beanpoll.js
- [fig](/crcn/fig) - Cross-platform view library (service single-page apps + static websites).
- [mesh-winston](/crcn/mesh-winston) - Cross-platform implementation of winston.
- [haba](/crcn/haba) - Module loader.


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

## Writing Libraries

There isn't much to writing cross-platform libraries. All you need to do is format your project like so:

- `src/` - source to your library
	- `common/` - common libraries for all platforms
	- `node/` - node specific code
	- `node web/` - node & web specific code
	- `whatever-you-want/` - specify any platform you want
	- `web/` - web specific code
		- `ie/` - ie specific code
			- `6/` - ie6 specific code

Make sure to also specify `src` in the `package.json` file. Like so:

```javascript
{
	"directories": {
		"mesh-src": "./src",
		"lib": "./lib"
	}
}
```

Mesh will traverse the source, and search for any platforms to copy over to the target platform directory: `lib/[platform]`.







