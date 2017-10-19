/*
	HTTP Parser class
*/

module.exports = HTTPParser;

function HTTPParser(rawHTTP){
	this.rawHTTP = rawHTTP;
	this.headers = new Array();
	this.body = "";
	this.status = 000;

	this.parseHeaders();
}

HTTPParser.prototype.parseHeaders = function() {
	let rawHTTPSplit = this.rawHTTP.split("\n");

	for(i in rawHTTPSplit) {
		if(rawHTTPSplit[i] == ''){
			return;
		}else{
			if (i == 1) {
				this.status = rawHTTPSplit[0].split(" ")[1]
			}
			let keyValue = rawHTTPSplit[i].split(":");
			this.headers.push(keyValue);
		}
	}
}

HTTPParser.prototype.getHeaders = function() {
	return this.headers;
}
HTTPParser.prototype.getStatus = function() {
	return this.status;
}