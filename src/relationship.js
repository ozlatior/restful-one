const R1Types = require("./types.js");

const util = require("./util.js");

class Relationship {

	constructor (template, name) {
		this.name = name ? name : template.entity;
		this.type = template.type;
		this.entity = template.entity;
		this.owned = template.owned ? true : false;
		this.reverseName = template.as ? template.as : null;
	}

	getName () {
		return this.name;
	}

	getType () {
		return this.type;
	}

	getTypeString () {
		return Relationship.getTypeString(this.type);
	}

	getEntity () {
		return this.entity;
	}

	getReverseName () {
		return this.reverseName;
	}

	isOwnedRelationship () {
		return this.owned;
	}

	getReverseType () {
		return Relationship.getReverseType(this.type);
	}

	// return a new relationship object that's the mirror relatioship of this
	getReverse (name, entity, owned) {
		return new Relationship({
			entity: entity,
			type: this.getReverseType(),
			owned: owned,
			as: this.name
		}, name);
	}

	toTemplate () {
		let ret = {};
		ret.entity = this.entity;
		ret.type = this.type;
		if (this.reverseName)
			ret.as = this.reverseName;
		if (this.owned)
			ret.owned = this.owned;
		return ret;
	}

	/* Options:
	 * - newLine: if true, format object data using new line (default: true)
	 * - indentation: for newLine formatting, indentation value for output object (default: 4)
	 * - depth: for newLine formatting, indentation depth to start from (default: 0)
	 * - definitions: for defined types (relationships and data types) use the model definition form (default: true)
	 * - relationshipPrefix: prefix to use for relationships (defaults to 'R1R.')
	 */
	toTemplateString (options) {
		if (options === undefined)
			options = {};
		let nln = options.newLine === false ? " " : "\n";
		let ind = options.indentation === undefined ? 4 : options.indentation;
		let dpt = options.depth === undefined ? 0 : options.depth;
		let def = options.definitions === undefined ? true : options.definitions;
		let rpr = options.relationshipPrefix === undefined ? "R1R." : options.relationshipPrefix;
		let ia = util.indentationArray(ind);

		let ret = [];

		ret.push(ia[dpt+1] + util.kvPair("entity", this.entity, false, true));

		if (def)
			ret.push(ia[dpt+1] + util.kvPair("type", rpr + this.getTypeString(), false, false));
		else
			ret.push(ia[dpt+1] + util.kvPair("type", this.getTypeString(), false, true));

		if (this.reverseName)
			ret.push(ia[dpt+1] + util.kvPair("as", this.reverseName, false, true));

		if (this.owned)
			ret.push(ia[dpt+1] + util.kvPair("owned", "true"));

		ret = "{" + nln + ret.join("," + nln) + nln + ia[dpt] + "}";

		return ret;
	}

}

Relationship.Type = R1Types.Relationship;

Relationship.getTypeString = function (type) {
	switch (type) {
		case Relationship.Type.ONE_TO_ONE:
			return "ONE_TO_ONE";
		case Relationship.Type.ONE_TO_MANY:
			return "ONE_TO_MANY";
		case Relationship.Type.MANY_TO_ONE:
			return "MANY_TO_ONE";
		case Relationship.Type.MANY_TO_MANY:
			return "MANY_TO_MANY";
	}
	return "UNKNOWN TYPE";
}

Relationship.getReverseType = function (type) {
	switch (type) {
		case Relationship.Type.ONE_TO_MANY:
			return Relationship.Type.MANY_TO_ONE;
		case Relationship.Type.MANY_TO_ONE:
			return Relationship.Type.ONE_TO_MANY;
	}
	return type;
}

module.exports = Relationship;
