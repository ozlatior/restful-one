const indentationArray = function (ind, depth) {
	if (depth === undefined)
		depth = 10;
	let ret = [];
	let str = "";
	let tab = "";
	for (let i=0; i<ind; i++)
		tab += " ";
	for (let i=0; i<depth; i++) {
		ret[i] = str;
		str += tab;
	}
	return ret;
}

const kvPair = function(key, value, kq, vq) {
	let ret = "";
	if (kq)
		ret += "\"";
	ret += key;
	if (kq)
		ret += "\"";
	ret += ": ";
	if (vq)
		ret += "\"";
	ret += value;
	if (vq)
		ret += "\"";
	return ret;
}

module.exports.indentationArray = indentationArray;
module.exports.kvPair = kvPair;
