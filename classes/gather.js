var request = require('request');
var urlParser = require('./urlParser');
var colors = require('colors');

module.exports = Gather;

function Gather(url) {
	this.url = new urlParser(url);
	this.domainName = this.url.getDomainName();

	this.gather = {
		'api' : 'http://api.hackertarget.com/',
		'actions' : {
			'hostsearch' : 'hostsearch/?q=',
			'subnetcalc' : 'subnetcalc/?q=',
			'dnslookup' : 'dnslookup/?q=',
			'whois' : 'whois/?q='
		}
	}
}

Gather.prototype.run = function(callback) {
	var instance = this;
	this.performAction('whois').then(function(result){
		console.log('\nPerforming Whois lookup: '.green.bold)
		console.log(result);

		instance.performAction('subnetcalc').then(function(result){
			console.log('\nSubnet calculation: '.green.bold)
			console.log(result);

			instance.performAction('dnslookup').then(function(result){
				console.log('\nDNS Lookup: '.green.bold)
				console.log(result);

				instance.performAction('hostsearch').then(function(result){
					console.log('\nHostnames: '.green.bold)
					console.log(result);
					callback();

				}); // hostsearch

			}); // dnslookup

		}); // subnetcalc

	}); // whois
}

Gather.prototype.performAction = function(action) {
	var instance = this;
	return new Promise(function(resolve, reject) {
		api = instance.gather['api'];
		action = instance.gather['actions'][action];
		request(api + action + instance.domainName, function(error, res, body) {
	      if (!error){
	        resolve(body)
	      }else
	        reject(error)
	    });
	})
}