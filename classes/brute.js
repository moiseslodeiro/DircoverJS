var request = require('request');
var lineByLine   = require('n-readlines');
var sprintf      = require("sprintf-js").sprintf;
var Promise      = require('bluebird');
var colors       = require('colors');

module.exports = Brute;

var wordlist = null;
var url = null;
var httpOptions = {}
var conRefusedErrorCounter = 0;
var conBlockedErrorCounter = 0; // Error 503 indicates IDS/WAF is detecting our activity

const MAX_REFUSE_ALLOWED = 15;
const MAX_BLOCKED_ALLOWED = 15;

const statusCodes = {
  200: {'color': colors.green.bold,  'text': 'OK'},
  204: {'color': colors.grey.bold,   'text': 'Empty'},
  301: {'color': colors.cyan.bold,   'text': 'Moved'},
  401: {'color': colors.yellow.bold, 'text': 'Unauth.'},
  404: {'color': colors.red.bold,    'text': 'NotFound'},
  500: {'color': colors.blue.bold,   'text': 'SrvError'}
};

function getColoredCode(statusCode) {
  if (statusCode in statusCodes)
    return statusCodes[statusCode].color(statusCode);
  return colors.yellow(statusCode);
}


function fuzzUrl(path) {
  return new Promise(function(resolve, reject) {
    var opts = httpOptions;
    opts.url = url + path;
    
    request(opts, function(error, res, body) {
      if (!error){
        resolve([path, res])
      }else
        reject(error)
    });
  });
}

function fuzzIterator(cb, end_cb) {
  readWordlist(wordlist, cb, end_cb);
}

function readWordlist(filename, cb, end_cb) {
  var line;
  var lineNumber = 0;
  var liner = new lineByLine(filename);
  while (line = liner.next()) {
    cb(line.toString('ascii'));
  }
  if (end_cb) 
    end_cb();
}
var count = 0;

function processResponse(args){	

	var path = args[0];
	var res   = args[1];
	var status = res.statusCode;

	if(status != "404" && status != "500") {
    printable = getColoredCode(status) + "  " + url + path;
    if(status == "301")
      printable += '/'
    
    if(path == 'robots.txt')
      printable += "  <- robots.txt found, maybe it contains some interesting paths".green.bold

    if(status == "503"){
      conBlockedErrorCounter++;
      if(conBlockedErrorCounter > MAX_BLOCKED_ALLOWED) {
        console.log("[Warning] Server seems to be detecting fuzzy activity, reduce the number of sockets with the options -s.".yellow.bold);
      }
    }
    
    console.log(printable)
	}
  
}

function Brute(url_,wordlist_,options) {
	url = url_;
	httpOptions = options;
	wordlist = wordlist_;
}

Brute.prototype.run = function() {
	fuzzIterator(function (value) {
	  fuzzUrl(value)
	    .then(processResponse)
	    .catch(function (err) {
        if (err.message.includes('ECONNREFUSED')) {
          conRefusedErrorCounter++;
          if(conRefusedErrorCounter > MAX_ERRORS_ALLOWED) {
            console.log(`[Error] Max connection refusing errors to the server reached (${MAX_ERRORS_ALLOWED}), maybe it uses some kind of IDS/WAF.`.red.bold)
            process.exit();
          }
        }
	      console.log(`[Warning] ${err.message} at ${value}`.yellow.bold)
	    })
	})
};