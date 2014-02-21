var combine = require( "stream-combiner" );
var events = require('events');
var path = require( "path" );
var fs = require( "fs" );

module.exports = function( packageJSON, assets, outputDir ) {

	var eventEmitter = new events.EventEmitter();

	var assetTypes = [ "image", "style", "template" ];

	assetTypes.forEach( function( assetType ) {
		if( ! assets[ assetType ] )
			return;

		assets[ assetType ].forEach( function( file ) {
			var transforms = packageJSON.cartero[ assetType + "Transform" ] || [];

			var outputStream = fs.createReadStream( file );

			if( transforms.length !== 0 ) {
				outputStream = outputStream.pipe( combine.apply( null, transforms.map( function( t ) {
					return require( t )( file );
				} ) ) );
				//outputStream = outputStream.pipe( transformStream );
			}

			if( assetType === "style" ) {
				file = renameFileExtension( file, ".css" );
			}

			outputStream.pipe( fs.createWriteStream( path.join( outputDir, path.relative( packageJSON.path, file ) ) ) );

		} );
	} );

	return eventEmitter;
};

function renameFileExtension( file, toExt ) {
	return file.replace( new RegExp( path.extname( file ) + "$" ), toExt );
}