var combine = require( "stream-combiner" );
var path = require( "path" );
var fs = require( "fs" );
var resolve = require( "resolve" );
var async = require( "async" );
var mkdirp = require( "mkdirp" );

module.exports = function( packageJSON, assets, outputDir, callback ) {
	var outputStreams = {};

	packageJSON.cartero = packageJSON.cartero || {};

	async.each( Object.keys( assets ), function( assetType, callback ) {
		var transforms = packageJSON.cartero[ assetType + "Transform" ] || [];

		async.each( assets[ assetType ], function( file, callback ) {
			var outputStream = fs.createReadStream( file );
			async.map( transforms, function( t, callback ) {
				resolve( t, { basedir : packageJSON.path }, function( err, res ) {
					if( err ) return callback( err );
					callback( null, require( res ) );
				} );
			}, function( err, results ) {
				if( err )
					return callback( err );

				var outputFile = path.join( outputDir, path.relative( packageJSON.path, file ) );

				mkdirp( path.dirname( outputFile ), function( err ) {
					if( err ) return callback( err );

					if( results.length !== 0 )
						outputStream = outputStream.pipe( combine.apply( null, results.map( function( t ) {
							return t( file );
						} ) ) );

					
					if( assetType === "style" ) {
						outputFile = renameFileExtension( outputFile, ".css" );
					}

					outputStream.pipe( fs.createWriteStream( outputFile ) );
					outputStreams[ file ] = outputStream;
					callback();
				} );
			} );

		}, function( err ) {
			callback( err );
		} );

	}, function( err ) {
		return callback( err, outputStreams );
	} );
};

function renameFileExtension( file, toExt ) {
	return file.replace( new RegExp( path.extname( file ) + "$" ), toExt );
}