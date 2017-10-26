/* 
	JS directory bruteforcer
	Asynchronous bruteforcer using non-blocking TCP sockets.
	Author: Gonzalo García
*/

var Brute = require('./classes/brute.js');
var bing = require('./classes/bing.js');
var pathTree = require('./classes/pathTree.js');
var prettyjson = require('prettyjson');


let url = "";
let wordlist = "";
let passive = false;
let passiveOnly = false;
var pTr = new pathTree();

let helpText = "\n"+
"██████╗ ██████╗ ██╗   ██╗████████╗███████╗     ██╗███████╗\n"+
"██╔══██╗██╔══██╗██║   ██║╚══██╔══╝██╔════╝     ██║██╔════╝\n"+
"██████╔╝██████╔╝██║   ██║   ██║   █████╗       ██║███████╗\n"+
"██╔══██╗██╔══██╗██║   ██║   ██║   ██╔══╝  ██   ██║╚════██║\n"+
"██████╔╝██║  ██║╚██████╔╝   ██║   ███████╗╚█████╔╝███████║\n"+
"╚═════╝ ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚══════╝ ╚════╝ ╚══════╝\n"+
"\nODS Dev.\n" +
"Author: Gonzalo García.\n\n"+
"Mandatory parameters\n"+
"-u <url>		Set the target URL, please specity '/' at the end of the URL\n"+
"\nActive mode:\n"+
"-w <wordlist path>	Specify the wordlist to use, common.txt by default\n"+
"-s <max_sockets>	Number of simultaneous sockets. Default is 150.\n"+
"-p 			Passive mode, use Bing to recognize directories too. By default, this mode is disabled\n"+
"\nOnly passive mode:\n"+
"-ponly Performs only passive recognition\n"+
"\nExample:\n"+
"node main.js -u https://example.com/ -w wordlists/big.txt -s 150\n"+
"node main.js -u https://example.com/ -w wordlists/big.txt -s 150 -p\n"+
"node main.js -u https://example.com/ -ponly\n"


process.argv.forEach(function (val, index, array) {
	switch(val) {
		case "-u": url = array[index+1];
							 break;
		case "-w": wordlist = array[index+1];
							 break;
		case "-p": passive = true;
							 break;
		case "-s": sockets = array[index+1];;
							 break;
		case "-ponly": passiveOnly = true;
		 					 	   break;
		case "-h": console.log(helpText);
							 process.exit();
							 break;
	}
});

if(passiveOnly == false) {
	if(passive == true) {
		b = new bing(10,url,pTr);
		b.discover(function(result){
			console.log(result.jsonStr())
		})
	}
	
	var fuzzerHttoOptions = {
	    method: 'GET',
	    url: url,
	    followRedirect: false,
	    form: null,
	    strictSSL: false,
	    proxy: null,
	    timeout: null,
	    headers: null,
	    pool: {
	      maxSockets: sockets
	    }
	};

	/*brute = new Brute(url,wordlist,fuzzerHttpOptions);
	brute.run();*/
} else{
	b = new bing(10,url,pTr);
	let prettyJsonOptions = {
  	noColor: false
	};
	b.discover(function(result){
		//console.log(prettyjson.render(result.json(), prettyJsonOptions))
		rootNode = result.getRootNode();
		result.treeView(rootNode);
	})
}

