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
};

const kvPair = function (key, value, kq, vq) {
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
};

const objectToHtml = function (obj, inlineStyle) {
	let out = JSON.stringify(obj, null, 2);
	out = out.split("\n").join("</div><div>").replace(/ /g, "&nbsp;");
	out = "<div>" + out;
	if (inlineStyle)
		out = "<div style='font-family: monospace'>" + out;
	else
		out = "<div>" + out;
	out += "</div></div>";
	return out;
};

module.exports.indentationArray = indentationArray;
module.exports.kvPair = kvPair;
module.exports.objectToHtml = objectToHtml;
