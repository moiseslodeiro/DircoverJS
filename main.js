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
