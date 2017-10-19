var fs = require('fs');
/*
	Dictionary class
*/

module.exports = Dictionary;

function Dictionary(filename) {
	this.filename = filename;
	this.dirArray = new Array();
}

Dictionary.prototype.getDirArray = function() {
	return this.dirArray;
}

Dictionary.prototype.length = function() {
	return this.getDirArray().length;
}

Dictionary.prototype.load = function() {
	try {  
    	this.dirArray = fs.readFileSync(this.filename, 'utf8');
    	this.dirArray = this.dirArray.split("\n");    
	} catch(e) {
    	console.log('Error:', e.stack);
	}
}