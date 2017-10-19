var Dictionary = require('./dictionary.js');
var urlParser = require('./urlParser.js');
var Request = require('./request.js');

/*
	Directory fuzzer.
*/

module.exports = Brute;

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