Example

```javascript
{
    "build": {
        "web:debug": ["combine"],
        "web:release": ["web:debug", "uglify"]
    },
    "tasks": {
        "all debug release": {
            "entry"   : "./src/index.js",
            "include" : "./src",
            "output"  : "./js/index.js",
            "build"   : "web:{{target}}"
        }
    }
}
```