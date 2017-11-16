/* 
	JS directory bruteforcer
	Asynchronous bruteforcer using non-blocking TCP sockets.
	Author: Gonzalo García
*/

var Brute = require('./classes/brute.js');
var bing = require('./classes/bing.js');
var pathTree = require('./classes/pathTree.js');
var gathering = require('./classes/gather.js');
var prettyjson = require('prettyjson');


let url = "";
let wordlist = "wordlists/big.txt";
let passive = false;
let passiveOnly = false;
let gather = false;
let gatherOnly = false;
let fullMode = false;
let sockets = 150;

const BING_MAX_PAGES = 60;

var pTr = new pathTree();

let logo = "\n"+
"██████╗ ██╗██████╗  ██████╗ ██████╗ ██╗   ██╗███████╗██████╗\n"+
"██╔══██╗██║██╔══██╗██╔════╝██╔═══██╗██║   ██║██╔════╝██╔══██╗\n"+
"██║  ██║██║██████╔╝██║     ██║   ██║██║   ██║█████╗  ██████╔╝\n"+
"██║  ██║██║██╔══██╗██║     ██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗\n"+
"██████╔╝██║██║  ██║╚██████╗╚██████╔╝ ╚████╔╝ ███████╗██║  ██║\n"+
"╚═════╝ ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝\n"+
"\nODS Dev.\n" +
"Author: Gonzalo García.\n\n";

console.log(logo)

let helpText = "Mandatory parameters\n"+
"-u <url>		Set the target URL, please specity '/' at the end of the URL\n"+
"\nActive mode:\n"+
"-w <wordlist path>	Specify the wordlist to use, common.txt by default\n"+
"-s <max_sockets>	Number of simultaneous sockets. Default is 100.\n"+
"\nPassive recognition modes:\n"+
"-p 			Passive directory discovery, use Bing to recognize directories too. By default, this mode is disabled\n"+
"-g 			Gather information from whois, hosts, dnslookup and subnet calculation.\n"+
"\nOnly modes:\n"+
"-ponly Performs only passive recognition\n"+
"-gonly Performs gathering only\n"+
"\nFull mode:\n"+
"-f Performs a big.txt search with 100 sockets, performs information gathering and performs passive directory discovery\n"+
"\nExample:\n"+
"Only Fuzz: node main.js -u https://example.com/ -w wordlists/big.txt -s 150\n"+
"Full discovery: node main.js -u https://example.com/ -w wordlists/big.txt -s 150 -p -g\n"+
"Only passive path discover: node main.js -u https://example.com/ -ponly\n";


process.argv.forEach(function (val, index, array) {
	switch(val) {
		case "-u": url = array[index+1];  		 
							 break;
		case "-w": wordlist = array[index+1];
							 break;
		case "-p": passive = true;
							 break;
		case "-g": gather = true;
							 break;
		case "-s": sockets = array[index+1];;
							 break;
		case "-f": fullMode = array[index+1];;
							 break;
		case "-gonly": gatherOnly = true;
							 		 break;
		case "-ponly": passiveOnly = true;
		 					 	   break;
		case "-h": console.log(helpText);
							 process.exit();
							 break;
	}
		
});

if(url[-1] != '/') { url += '/'}

function performActive(callback){
	console.log('\nPerfoming active fuzzing'.bold)
	var fuzzerHttpOptions = {
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

	brute = new Brute(url,wordlist,fuzzerHttpOptions);
	brute.run();
}

function performPassive(callback) {
	console.log('Perfoming passive discovery (using Bing, wait a little bit...)'.bold)
	b = new bing(BING_MAX_PAGES,url,pTr);

	b.discover(function(result){
		rootNode = result.getRootNode();
		result.treeView(rootNode);
		
		if(callback != null) {
			callback();
		}	
	})
}

function performGathering(callback){
	console.log('Perfoming information gathering'.bold)
	g = new gathering(url.slice(0,url.length-1));
	g.run(function(){
		if(callback != null) {
			callback();
		}
	});	
}

// Warning! This code can give you cancer, needs to be changed.

if(passiveOnly == false && gatherOnly == false) {

	if(passive == true && gather == false) { // Passive + active mode - gather

		performPassive(function(){
			performActive()
		});

	} else if(passive == true && gather == true) { // Passive + active + gather

		performGathering(function(){
			performPassive(function(){
				performActive();
			});
		});

	} else if(passive == false && gather == true){ // -Passive + active + gather

		performPassive(function(){
			performGathering(null)
		});

	} else {
		performActive(null);
	}

} else { // Only Modes
	if(passiveOnly == true) {
		performPassive(null);
	}
	if(gatherOnly == true) {
		performGathering();
	}
}

	
