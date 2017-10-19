/* 
	JS directory bruteforcer
	Asynchronous bruteforcer using non-blocking TCP sockets.
	Author: Gonzalo García
*/

var Dictionary = require('./classes/dictionary.js');
var HTTPParser = require('./classes/httpParser.js');
var Request = require('./classes/request.js');
var urlParser = require('./classes/urlParser.js');
var Brute = require('./classes/brute.js');
var bing = require('./classes/bing.js')


let url = "";
let wordlist = "";
let reqPerSec = 0;
let passive = false;

process.argv.forEach(function (val, index, array) {
	switch(val) {
		case "-u": url = array[index+1];
							 break;
		case "-w": wordlist = array[index+1];
							 break;
		case "-r": reqPerSec = array[index+1];
							 break;
		case "-p": passive = true;
							 break;
		case "-h": "-u <url> -w <wordlist> -r <requests per second> [-p (passive)]";
							 break;
	}
});

if(passive == true) {
	b = new bing(10,url);
	b.discover(function(result){
		console.log(result.jsonStr())
	})
}

brute = new Brute(url,wordlist);
brute.run(reqPerSec);
