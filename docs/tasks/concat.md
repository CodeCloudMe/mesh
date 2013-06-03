The Concat task combines multiple files into one.

### Parameters
	- `--input` - (required) Input files. 
	- `--output` - (required) The output file to write to. 


### Examples

#### JSON

```javascript
{
	"concat": {
		"input": ["./jquery.js", "./underscore.js"],
		"output": "./combined.js"
	}
}
```


#### Running the example
```