const Types = require("./types.js");

const util = require("./util.js");

class Property {

	constructor (template, name) {
		this.name = name;
		if (template.property)
			this.name = template.property;
		this.type = template.type;
		if (template.properties) {
			// TODO: handle this, also in toString function
		}
	}

	getName () {
		return this.name;
	}

	getType () {
		return this.type;
	}

	toTemplate () {
		let ret = {};
		ret.property = this.name;
		ret.type = this.type;
		return ret;
	}

	/* Options:
	 * - newLine: if true, format object data using new line (default: true)
	 * - indentation: for newLine formatting, indentation value for output object (default: 4)
	 * - depth: for newLine formatting, indentation depth to start from (default: 0)
	 * - definitions: for defined types (relationships and data types) use the model definition form (default: true)
	 * - typePrefix: prefix to use for types (defaults to 'R1T.')
	 */
	toTemplateString (options) {
		if (options === undefined)
			options = {};
		let nln = options.newLine === false ? " " : "\n";
		let ind = options.indentation === undefined ? 4 : options.indentation;
		let dpt = options.depth === undefined ? 2 : options.depth;
		let def = options.definitions === undefined ? true : options.definitions;
		let tpr = options.typePrefix === undefined ? "R1T." : options.typePrefix;
		let ia = util.indentationArray(ind);

		let ret = [];

		ret.push(ia[dpt+1] + util.kvPair("property", this.name, false, true));
		if (def)
			ret.push(ia[dpt+1] + util.kvPair("type", tpr + Types.getCall(this.type)));
		else
			ret.push(ia[dpt+1] + util.kvPair("type", this.type.serialize()));

		ret = "{" + nln + ret.join("," + nln) + nln + ia[dpt] + "}";

		return ret;
	}

}

module.exports = Property;
