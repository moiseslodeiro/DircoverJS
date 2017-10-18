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

function HTTPParser(rawHTTP) {
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

urlParser.prototype.getPath = function() {
	hostname = this.getHostName();
	paths = hostname.split('/');
	paths = paths.slice(1,paths.length); // Deletes the own hostname
	return paths;
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
		callback('null',false);
	}
}

Brute.prototype.pushRequestToQeue = function(path) {
	req = new Request(this.port,this.hostname,path);
	this.requestsQueue.push(req);
}

Brute.prototype.run = function(requestsPerSecond) {
	const dictLength = this.dictionary.length();
	const forDictArray = this.dictionary.getDirArray()
	let instance = this;

	let timeToWait = 1000/requestsPerSecond;
	let counter = 0;

	console.log("Dictionary length: " + dictLength);
	console.log("req/sec: " + 1000/timeToWait);
	console.log("");

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
		
	},timeToWait);
}

/* Represents a paths tree */
function pathTree() {
	Node = require('tree-node');
	this.rootNode = new Node('rootPath');
}

/* Receives a path represented as a string */
pathTree.prototype.add = function(rawUrl) {
	let url = new urlParser(rawUrl);
	let pathArray = url.getPath();

	/* /location/pepito.html */
	/* /location/pepito/pepito.html */
	let pathNode = new Node(pathArray[0]);
	if (this.rootNode.getNode(pathNode.id) == null) {
		this.rootNode.appendChild(pathNode);
	} else {
		pathNode = this.rootNode.getNode(pathNode.id);
	}
	
	if(pathArray.length > 1) {
		for(i = 1; i < pathArray.length; i++) {
			childNode = new Node(pathArray[i]);
			if(pathNode.getNode(childNode.id) == null) {
				pathNode.appendChild(childNode);
				pathNode = childNode;
			} else {		
				pathNode = pathNode.getNode(childNode.id);
			}
		}
	}
}

pathTree.prototype.jsonStr = function() {
	return JSON.stringify(this.rootNode.json);
}

/* Discovers paths using Google */
function googlePathDiscover(url) {
	this.google = require('google');
	this.url = new urlParser(url);
	this.hostname = this.url.getHostName();
	this.pathTree = new pathTree();

	let instance = this;

	this.google.resultsPerPage = 300;
	this.nextCounter = 0;
}

googlePathDiscover.prototype.discover = function(callback) {
	var instance = this;
	this.google('site:' + this.hostname, function (err, res){
	  if (err) console.error(err);

	  for (var i = 0; i < res.links.length; ++i) {
	    var link = res.links[i];
	    instance.pathTree.add(link.href);
	  }

	  if (instance.nextCounter < 4) {
	    instance.nextCounter += 1
	    if (res.next) res.next()
	  }
		callback(instance.pathTree);
	});
}

let url = "";
let wordlist = "";
let reqPerSec = 0;
/*
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
brute.run(reqPerSec);*/

googleVar = new googlePathDiscover('https://www.ull.es')
googleVar.discover(function(pathTree){
	console.log(pathTree.jsonStr().length);
})

//console.log(JSON.stringify(googleVar.pathTree.jsonStr()))

/*tr = new pathTree();
tr.add('https://www.ull.es/publicaciones/latina/2002/latina46enero/4609edo.htm');
tr.add('https://www.ull.es/publicaciones/pepito/hola/test.html');
console.log(JSON.stringify(tr.rootNode))*/
