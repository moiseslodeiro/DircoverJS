var request = require('request');
var lineByLine   = require('n-readlines');
var sprintf      = require("sprintf-js").sprintf

module.exports = Brute;

var wordlist = null;
var url = null;
var http_opts = {
    method: 'GET',
    url: url,
    followRedirect: false,
    form: null,
    strictSSL: false,
    proxy: null,
    timeout: null,
    headers: null,
    pool: {
      maxSockets: 150
    }
};

function fuzzUrl(path) {
  return new Promise(function(resolve, reject) {
    var opts = http_opts
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

function test(args){	

	var path = args[0];
	var res   = args[1];
	var status = res.statusCode;

	if(res.statusCode != "404") { 
		console.log("[" + res.statusCode + "] " + url + path)
	}
}

function Brute(url_,wordlist_) {
	url = url_;
	http_opts.url = url_;
	wordlist = wordlist_;
}

Brute.prototype.run = function() {
	fuzzIterator(function (value) {
	  fuzzUrl(value)
	    .then(test)
	    .catch(function (err) {
	      console.log(err.message + ' AT ' + value)
	    })
	})
};