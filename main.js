/* 
	JS directory bruteforcer
	Asynchronous bruteforcer using non-blocking TCP sockets.
	Author: Gonzalo García
*/

var Brute = require('./classes/brute.js');
var bing = require('./classes/bing.js')


let url = "";
let wordlist = "";
let passive = false;

process.argv.forEach(function (val, index, array) {
	switch(val) {
		case "-u": url = array[index+1];
							 break;
		case "-w": wordlist = array[index+1];
							 break;
		case "-p": passive = true;
							 break;
		case "-h": "-u <url> -w <wordlist> [-p (passive)]";
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
brute.run();
