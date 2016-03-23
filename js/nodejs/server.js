var http = require("http");

http.createServer(function (req, res) 
{
	console.log( res );	

	res.writeHead(200, {"Content-Type": "text/plain"});
	res.end("Hello World\n");

}).listen(8124, "127.0.0.1");


var serialport = require("serialport");
var SerialPort = serialport.SerialPort;

var serial = new SerialPort( "/dev/cu.usbmodem641", 
{
	baudrate: 9600,
	parser: serialport.parsers.readline( "\n" )
});

serial.on( "open", function () 
{
	console.log('open');

	serial.on('data', function(data) 
	{
		console.log('data received: ' + data);
	});

	// serialPort.write("ls\n", function(err, results) 
	// {
	// 	console.log('err ' + err);
	// 	console.log('results ' + results);
	// });
});

console.log("\nServer running at http://127.0.0.1:8124/\n");

// var app = require('http').createServer(handler)
// var io = require('socket.io')(app);
// var fs = require('fs');

// app.listen(80);

// function handler (req, res) {
//   fs.readFile(__dirname + '/index.html',
//   function (err, data) {
//     if (err) {
//       res.writeHead(500);
//       return res.end('Error loading index.html');
//     }

//     res.writeHead(200);
//     res.end(data);
//   });
// }

// io.on('connection', function (socket) {
//   socket.emit('news', { hello: 'world' });
//   socket.on('my other event', function (data) {
//     console.log(data);
//   });
// });