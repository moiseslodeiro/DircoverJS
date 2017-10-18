/* 

	JS directory bruteforcer
	Asynchronous bruteforcer using non-blocking TCP sockets.
	Author: Gonzalo García

*/

var fs = require('fs');
var net = require('net');

/*
	Dictionary class
*/

function Dictionary(filename) {
	this.filename = filename;
	this.dirArray = new Array();
}

Dictionary.prototype.getDirArray = function() {
	return this.dirArray;
}

Dictionary.prototype.length = function() {
	return this.getDirArray().length;
}

Dictionary.prototype.load = function() {
	try {  
    	this.dirArray = fs.readFileSync(this.filename, 'utf8');
    	this.dirArray = this.dirArray.split("\n");    
	} catch(e) {
    	console.log('Error:', e.stack);
	}
}

/*
	HTTP Parser class
*/

function HTTPParser(rawHTTP){
	this.rawHTTP = rawHTTP;
	this.headers = new Array();
	this.body = "";
	this.status = 000;

	this.parseHeaders();
}

HTTPParser.prototype.parseHeaders = function() {
	let rawHTTPSplit = this.rawHTTP.split("\n");

	for(i in rawHTTPSplit) {
		if(rawHTTPSplit[i] == ''){
			return;
		}else{
			if (i == 1) {
				this.status = rawHTTPSplit[0].split(" ")[1]
			}
			let keyValue = rawHTTPSplit[i].split(":");
			this.headers.push(keyValue);
		}
	}
}

HTTPParser.prototype.getHeaders = function() {
	return this.headers;
}
HTTPParser.prototype.getStatus = function() {
	return this.status;
}

function Request(port,hostname,path) {
	this.port = port;
	this.hostname = hostname;
	this.path = path;
	this.defaultTimeout = 3000;
}

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

/*
	URL Parser
*/

function urlParser(url){
	this.url = url;
}

urlParser.prototype.getPort = function(){
	protocol = this.url.split(":")[0];
	switch(protocol) {
		case "http": return 80;
								 break;
		case "https": return 443;
									break;
		case "ftp": return 21;
								break;
		default: return false;
						 break;
	}
}
// TODO: URL can contain basic authentication (prot://user:pass@hostname)
urlParser.prototype.getHostName = function() {
	hostname = this.url.split("://")[1];
	return hostname;
}

/*
	Bruteforcer class
*/

function Brute(url, wordlist) {
	this.dictionary = new Dictionary(wordlist);
	this.dictionary.load();

	this.url = new urlParser(url);
	this.hostname = this.url.getHostName();
	this.port = this.url.getPort();
	
	this.requestsQueue = new Array();
}

Brute.prototype.popRequest = function(callback) {
	if(this.requestsQueue.length != 0) {
		req = this.requestsQueue.pop();
			req.get(function(res){
				callback(req.path,res);
			});
	} else {
		callback('null',false)
	}
}

Brute.prototype.pushRequestToQeue = function(path) {
	req = new Request(this.port,this.hostname,path);
	this.requestsQueue.push(req);
}

Brute.prototype.run = function(requestsPerSecond) {
	const dictLength = this.dictionary.length();
	const forDictArray = this.dictionary.getDirArray()
	var instance = this;

	var timeToWait = 1000/requestsPerSecond;
	var counter=0;

	console.log("Dictionary length: " + dictLength);
	console.log("req/sec: " + 1000/timeToWait);
	console.log("")

	for (i = 0; i < dictLength; i++) {
		this.pushRequestToQeue(forDictArray[i]);
	}

	setInterval(function() {	
		if(counter == dictLength){ process.exit(); }
		
		instance.popRequest(function(path,response){
			if(response == false) {
				instance.pushRequestToQeue(path);
			}else {
				counter++;
			}
		});
		
	},timeToWait)
}

let url = "";
let wordlist = "";
let reqPerSec = 0;

process.argv.forEach(function (val, index, array) {
	switch(val) {
		case "-u": url = array[index+1];
								 break;
		case "-w": wordlist = array[index+1];
							 break;
		case "-r": reqPerSec = array[index+1];
								break;
		case "-h": "-u <url> -w <wordlist> -r <requests per second>";
						 		break;
	}
});

brute = new Brute(url,wordlist);
brute.run(reqPerSec);
