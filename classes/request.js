var net = require('net');
var HTTPParser = require('./httpParser.js')

/*
	HTTP Request class.
*/

module.exports = Request;

function Request(port,hostname,path) {
	this.port = port;
	this.hostname = hostname;
	this.path = path;
	this.defaultTimeout = 3000;
}

//TODO: data event should not be the responsible
// of print the path found and the response status.
Request.prototype.get = function(callback) {
	let connection = new net.Socket();
	connection.setTimeout(this.defaultTimeout);
	var instance = this;


	connection.connect(this.port,this.hostname, function(){
		this.write("GET /" + instance.path + " HTTP/1.1\r\n" + 
					"Host: "+ instance.hostname +"\r\n" +
					"\r\n");
		this.end();
	});

	connection.on('timeout', () => {
		//console.log('to');
		callback(instance.path,false);
	});

	connection.on('error', () => {
		//console.log('err');
		callback(instance.path,false);
	});

	connection.on('data', function(data) {
		res = new HTTPParser("" + data);
		status = res.getStatus();
		message = "";
		switch(status) {
			case "200": message = "[200] OK: ";
									break;
			case "301": message = "[301] Found: ";
									break;
			case "302": message = "[302] Redirect: ";
									break;
			case "403": message= "[403] Forbbiden: ";
									break;
		}
		if(message != "") {
			console.log(message + instance.hostname + "/" + instance.path)
		}
		this.destroy(); // kill client after full server's response
		callback(this.path,true);
	});
}