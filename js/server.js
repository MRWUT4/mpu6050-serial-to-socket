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