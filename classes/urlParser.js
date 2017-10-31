/*
	URL Parser
*/

module.exports = urlParser;

function urlParser(url){
	this.url = url;
}

urlParser.prototype.getPort = function(){
	protocol = this.url.split(":")[0];
	switch(protocol) {
		case "http": return 80;
								 break;
		case "https": return 443;
									break;
		case "ftp": return 21;
								break;
		default: return false;
						 break;
	}
}
// TODO: URL can contain basic authentication (prot://user:pass@hostname)
urlParser.prototype.getHostName = function() {
	hostname = this.url.split("://")[1];
	return hostname;
}

urlParser.prototype.getDomainName = function(){
	hostname = this.getHostName();
	commonNames = hostname.split('.'); //['www','example','co','uk']
	if(commonNames.length > 2) {
		domainName = commonNames.slice(1,commonNames.length); // delete subdomain
		domainName = domainName.join('.'); //join string again separated by '.'
		return domainName;
	} else {
		return hostname; 
	}
}

urlParser.prototype.getPath = function() {
	hostname = this.getHostName();
	paths = hostname.split('/');
	paths = paths.slice(1,paths.length); // Deletes the own hostname
	return paths;
}