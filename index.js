var combine = require( "stream-combiner" );
var path = require( "path" );
var fs = require( "fs" );
var resolve = require( "resolve" );

module.exports = function( packageJSON, assets, outputDir ) {
	var outputStreams = {};

	packageJSON.cartero = packageJSON.cartero || {};

	Object.keys( assets ).forEach( function( assetType ) {
		assets[ assetType ].forEach( function( file ) {
			var transforms = packageJSON.cartero[ assetType + "Transform" ] || [];

			var outputStream = fs.createReadStream( file );

			if( transforms.length !== 0 ) {
				outputStream = outputStream.pipe( combine.apply( null, transforms.map( function( t ) {
					return require( resolve.sync( t, { basedir : packageJSON.path } ) )( file );
				} ) ) );
			}

			outputStreams[ file ] = outputStream;

			var outputFile = path.join( outputDir, path.relative( packageJSON.path, file ) );
			if( assetType === "style" ) {
				outputFile = renameFileExtension( outputFile, ".css" );
			}

			outputStream.pipe( fs.createWriteStream( outputFile ) );

		} );
	} );

	return outputStreams;
};

function renameFileExtension( file, toExt ) {
	return file.replace( new RegExp( path.extname( file ) + "$" ), toExt );
}