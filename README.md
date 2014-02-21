# package-writer

Transforms and writes the files for a cartero package.  Returns a map of file name to transformed output stream.

# Methods

``` js
var packageWriter = require('package-writer');
```

## packageWriter(packageJSON, assets, outputDir)

Returns a map of file name to output stream for the transformed file contents.

Parameters:
`packageJSON` - The package info for the package being written.  Should contain:
* `path` - the directory of the package
* `cartero` - any transforms that need to be performed on the assets in the package.  Valid properties are `styleTransform`, `imageTransform`, and `templateTransform`.

`assets` - A map of asset type to files.  The valid asset types are `style`, `image`, and `template`.
`outputDir` - The directory where the transformed/copied files should be outputted.

Example:

```
var packageJSON = {
	path : "/path/to/app/package1",
	cartero : {
		styleTransform : [ "sass-transform" ]
	}
};

var assets = {
	style : [ "/path/to/app/package1/styles.sass" ]
};

var outputDir = "/path/to/app/static/package1Output";

var outputStreams = packageWriter( packageJSON, assets, outputDir );

```
