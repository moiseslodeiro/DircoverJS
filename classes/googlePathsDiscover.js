var urlParser = require('./urlParser.js');
var pathTree = require('./pathTree.js');

/* 
	Discovers paths using Google 
*/

module.exports = googlePathDiscover;

function googlePathDiscover(url) {
	this.google = require('google');
	this.url = new urlParser(url);
	this.hostname = this.url.getHostName();
	this.pathTree = new pathTree();

	let instance = this;

	this.google.resultsPerPage = 300;
	this.nextCounter = 0;
}

// Returns callback with JSON path tree structure.
googlePathDiscover.prototype.discover = function(callback) {
	var instance = this;
	this.google('site:' + this.hostname, function (err, res){
	  if (err) console.error(err);

	  for (var i = 0; i < res.links.length; ++i) {
	    var link = res.links[i];
	    instance.pathTree.add(link.href);
	  }

	  if (instance.nextCounter < 4) {
	    instance.nextCounter += 1
	    if (res.next) res.next()
	  }
		callback(instance.pathTree);
	});
}