const https = require('https');
var cheerio = require('cheerio');
var pathTree = require('./pathTree.js');

module.exports = bing;

function bing(pages,query){
	this.template_url = 'https://www.bing.com/search?q=site:' + query + '&first=NUM_PAGES&FORM=PERE';
	this.url = "";
	this.results = new Array();
	this.numPages = pages;
	this.pt = new pathTree();
}

/* Returns a pathTree object with the scraped paths*/
bing.prototype.discover = function(callback) {
	var instance = this;
	var queriesCounter = 0;
	var disc = setInterval(function(){

		instance.url = instance.template_url.replace('NUM_PAGES',queriesCounter*9-8);

		instance.get(function(responseBody) {
			/* Bing page links scrapper */
			$ = cheerio.load(responseBody);
			items = $('#b_results');
				
			for(let i=0; i < items.children().length; i++) {
				result = {}
				if(items["0"].children[i].children[0].children[0].name == "a") {
					result.link = items["0"].children[i].children[0].children[0].attribs.href;
					instance.pt.add(result.link)
				}
			}
			queriesCounter++;
		});

		if(queriesCounter  == instance.numPages) {
			clearInterval(this);
			callback(instance.pt);		
		}

	},700);
}

bing.prototype.get = function(callback) {
	https.get(this.url, (response) => {
		var body = '';
		response.on('data',(chunk) => {
			body+=chunk;
		})
		response.on('end', function () {
	    	callback(body);
	  	});
	})
};
/* Usage:

b = new bing(1,'www.ull.es');
b.discover(function(result){
	console.log(result.jsonStr())
})

*/