var request = require('request');
var lineByLine   = require('n-readlines');
var sprintf      = require("sprintf-js").sprintf;
var Promise      = require('bluebird');

module.exports = Brute;

/*
	Code structure from: https://github.com/danigargu/urlfuzz
*/

var wordlist = null;
var url = null;
var httpOptions = {}

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

	if(res.statusCode != "404" && res.statusCode != "500") { 
		console.log("[" + res.statusCode + "] " + url + path)
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
	      console.log(err.message + ' AT ' + value)
	    })
	})
};