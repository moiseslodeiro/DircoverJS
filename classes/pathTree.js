var Node = require('tree-node');
var urlParser = require('./urlParser');

/* 
	Represents a paths tree 
*/

module.exports = pathTree;

function pathTree() {
	this.rootNode = new Node('rootPath');
}

/* Receives a path represented as a string */
pathTree.prototype.add = function(rawUrl) {
	let url = new urlParser(rawUrl);
	let pathArray = url.getPath();

	let pathNode = new Node(pathArray[0]);
	if (this.rootNode.getNode(pathNode.id) == null) {
		this.rootNode.appendChild(pathNode);
	} else {
		pathNode = this.rootNode.getNode(pathNode.id);
	}
	
	if(pathArray.length > 1) {
		for(let i = 1; i < pathArray.length; i++) {
			childNode = new Node(pathArray[i]);
			if(pathNode.getNode(childNode.id) == null) {
				pathNode.appendChild(childNode);
				pathNode = childNode;
			} else {		
				pathNode = pathNode.getNode(childNode.id);
			}
		}
	}
}

pathTree.prototype.json = function() {
	return this.rootNode.json;
}

pathTree.prototype.getRootNode = function() {
	return this.rootNode;
}

pathTree.prototype.jsonStr = function() {
	return JSON.stringify(this.rootNode.json);
}

/*pathTree.prototype.treeView = function(child) {
	if(child != null) {
		console.log(child.id)
		child.childsId.forEach(childN
		this.treeView(child.nextNode())
	}
}*/