var urlParser = require('./urlParser.js');
var pathTree = require('./pathTree.js');

/* 
	Discovers paths using Google 
*/

module.exports = passiveDiscover;

function passiveDiscover(url) {
	this.google = require('google');
	this.url = new urlParser(url);
	this.hostname = this.url.getHostName();
	this.pathTree = new pathTree();
}

// Returns callback with JSON path tree structure.
passiveDiscover.prototype.google = function(callback) {

	this.google.resultsPerPage = 300;
	var nextCounter = 0;

	var instance = this;

	this.google('site:' + this.hostname, function (err, res){
	  if (err) console.error(err);

	  for (var i = 0; i < res.links.length; ++i) {
	    var link = res.links[i];
	    instance.pathTree.add(link.href);
	  }

	  if (nextCounter < 4) {
	  	callback(instance.pathTree);
	    nextCounter += 1
	    if (res.next) res.next()
	  }
	});

}


passiveDiscover.prototype.bing = function(callback) {
	
}