/**
 * Node HTTP Server
 */

var http = require( 'http' );

var server = http.createServer(function (req, res) 
{
	// fs.readFile(__dirname + '/index.html',
	// function (err, data) 
	// {
	// 	if (err) 
	// 	{
	// 		res.writeHead(500);
	// 		return res.end('Error loading index.html');
	// 	}

	// 	res.writeHead(200);
	// 	res.end(data);
	// });
});

server.listen( 8124 );




/**
 * Socket connection.
 */

var io = require('socket.io')( server );
// var fs = require('fs');

this.socket = null;

io.on('connection', function (socket) 
{
	socket.emit('news', { hello: 'world' });
	global.socket = socket;

	console.log( "\n --------------" );
	// socket.on('my other event', function (data) 
	// {
	// 	console.log(data);
	// });
});


/**
 * Serial Port Connection
 */

var serialport = require('serialport');
var SerialPort = serialport.SerialPort;

var serial = new SerialPort( '/dev/cu.usbmodem641', 
{
	baudrate: 9600,
	parser: serialport.parsers.readline( '\n' )
});

serial.on( 'open', function () 
{
	serial.on('data', function(data) 
	{
		if( global.socket )
			global.socket.emit( 'serial', data );
	});
});