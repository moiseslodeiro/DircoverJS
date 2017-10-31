var Node = require('tree-node');
var urlParser = require('./urlParser');
var colors = require('colors');

/* 
	Represents a paths tree 
*/
const layers = {
  1: {'color': colors.green.bold },
  2: {'color': colors.yellow },
  3: {'color': colors.cyan },
  4: {'color': colors.blue },
  5: {'color': colors.magenta },
  6: {'color': colors.grey }
};

module.exports = pathTree;

function pathTree() {
	this.rootNode = new Node('rootPath');
}

/* Receives a path represented as a string */
pathTree.prototype.add = function(rawUrl) { 
	let url = new urlParser(rawUrl);
	let pathArray = [];

	pathArray.push(url.getHostName());
	pathArray = pathArray.concat(url.getPath());

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

pathTree.prototype.colorizePath = function(formatedPath,layer) { 
	if (layer in layers)
    	return layers[layer].color(formatedPath);
  	return colors.yellow(formatedPath);
}

pathTree.prototype.treeView = function(node) {

	var instance = this;
	if(node != null) {
		if(node.id != "rootPath") {
			if(node.layer() == 1) {
				console.log(""); // \n 
			}
			console.log( this.colorizePath(`${"-".repeat(node.layer())}/${node.id}`,node.layer()) )
		}
		childsIds = node._childIdsList; //Hijos de node
		childsIds.forEach(function(childId){
			if(childId[0] != '-') {
				instance.treeView(
					node.getNode(childId)
				)
			}
		})
	} else {
			return;
	}
}