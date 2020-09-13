const Property = require("./property.js");
const Relationship = require("./relationship.js");

const util = require("./util.js");

// TODO: implement
class ModelError extends Error {
}

class Model {

	constructor (d, name) {
		this.name = name ? name : d.name;
		this.id = new Property(d.id, "id");
		this.owner = d.ownership ? new Relationship(d.ownership, "owner") : null;
		this.attributes = [];
		this.relationships = [];

		if (d.attributes)
			for (let i in d.attributes)
				this.attributes.push(new Property(d.attributes[i], i));
		if (d.relationships)
			for (let i in d.relationships)
				this.relationships.push(new Relationship(d.relationships[i], i));

		this.buildKeys();
	}

	buildKeys () {
		this.keys = [];
		this.keys.push(this.id.getName());
		if (this.owner)
			this.keys.push(this.owner.getName());
		for (let i=0; i<this.attributes.length; i++) {
			let name = this.attributes[i].getName();
			if (this.keys.indexOf(name) !== -1)
				throw new ModelError("Duplicate key " + name);
			this.keys.push(name);
		}
		for (let i=0; i<this.relationships.length; i++) {
			let name = this.relationships[i].getName();
			if (this.keys.indexOf(name) !== -1)
				throw new ModelError("Duplicate key " + name);
			this.keys.push(name);
		}
	}

	/* Run through array arr and create all reverse relationships between
	 * Model objects in arr and this object, on both sides */
	createReverseRelationships (arr) {
		let rel;
		// avoid duplicates with this array
		let added = [];
		for (let i=0; i<arr.length; i++) {
			// owner relationship?
			rel = arr[i].getOwner();
			if (rel && rel.getEntity() === this.name)
				added.push(this.addRelationship(rel.getReverse(Model.STRINGS.OWNED + arr[i].name, arr[i].name, true)));
			// owned relatioship?
			rel = this.getOwner();
			if (rel && rel.getEntity() === arr[i].getName())
				added.push(arr[i].addRelationship(rel.getReverse(Model.STRINGS.OWNED + this.name, this.name, true)));
			// relationship from target to this model
			rel = arr[i].getRelationshipsByEntity(this.name);
			for (let j=0; j<rel.length; j++) {
				if (added.indexOf(rel[j]) !== -1)
					continue;
				let reverseName = rel[j].getReverseName();
				if (!reverseName)
					reverseName = arr[i].name;
				added.push(this.addRelationship(rel[j].getReverse(reverseName, arr[i].name)));
			}
			// relationship from this model to target
			rel = this.getRelationshipsByEntity(arr[i].getName());
			for (let j=0; j<rel.length; j++) {
				if (added.indexOf(rel[j]) !== -1)
					continue;
				let reverseName = rel[j].getReverseName();
				if (!reverseName)
					reverseName = this.name;
				added.push(arr[i].addRelationship(rel[j].getReverse(reverseName, this.name)));
			}
		}

		this.buildKeys();

		return added;
	}

	/* Run through array arr and print all relationships */
	logRelationships (arr, logfn) {
		if (!logfn)
			logfn = console.log;
		logfn("> " + this.name);
		let rel;
		for (let i=0; i<arr.length; i++) {
			logfn(" - " + arr[i].getName());
			if (this === arr[i])
				logfn("   (self object)");
			// owner relationship?
			rel = arr[i].getOwner();
			if (rel && rel.getEntity() === this.name)
				logfn("     " + this.name + " is owner of " + arr[i].getName() + " (" + rel.getTypeString() + ")");
			// owned relatioship?
			rel = this.getOwner();
			if (rel && rel.getEntity() === arr[i].getName())
				logfn("     " + arr[i].getName() + " is owner of " + this.name + " (" + rel.getTypeString() + ")");
			// relationship from this model to target
			rel = this.getRelationshipsByEntity(arr[i].getName());
			for (let j=0; j<rel.length; j++)
				logfn("     " + rel[j].getName() + ": " + arr[i].getName() + " has " + this.name +
					(rel[j].isOwnedRelationship() ? " as owner" : "") + " (" + rel[j].getTypeString() + ")");
			// relationship from target to this model
			rel = arr[i].getRelationshipsByEntity(this.name);
			for (let j=0; j<rel.length; j++)
				logfn("     " + rel[j].getName() + ": " + this.name + " has " + arr[i].getName() +
						(rel[j].isOwnedRelationship() ? " as owner" : "") + " (" + rel[j].getTypeString() + ")");
		}
	}

	addRelationship (r) {
		this.relationships.push(r);
		return r;
	}

	getName () {
		return this.name;
	}

	getId () {
		return this.id;
	}

	getOwner () {
		return this.owner;
	}

	getKeys () {
		return this.keys;
	}

	getAttributeByName (name) {
		for (let i=0; i<this.attributes.length; i++)
			if (this.attributes[i].getName() === name)
				return this.attributes[i];
		return null;
	}

	getRelationshipByName (name) {
		for (let i=0; i<this.relationships.length; i++)
			if (this.relationships[i].getName() === name)
				return this.relationships[i];
		return null;
	}

	getRelationshipsByEntity (name) {
		let ret = [];
		for (let i=0; i<this.relationships.length; i++)
			if (this.relationships[i].getEntity() === name)
				ret.push(this.relationships[i]);
		return ret;
	}

	toTemplate () {
		let ret = {};
		ret.name = this.name;
		if (this.owner)
			ret.ownership = this.owner.toTemplate();
		ret.id = this.id.toTemplate();

		if (this.attributes && this.attributes.length) {
			ret.attributes = {};
			for (let i=0; i<this.attributes.length; i++)
				ret.attributes[this.attributes[i].getName()] = this.attributes[i].toTemplate();
		}

		if (this.relationships && this.relationships.length) {
			ret.relationships = {};
			for (let i=0; i<this.relationships.length; i++)
				ret.relationships[this.relationships[i].getName()] = this.relationships[i].toTemplate();
		}

		return ret;
	}

	/* Options:
	 * - newLine: if true, format object data using new line (default: true)
	 * - indentation: for newLine formatting, indentation value for output object (default: 4)
	 * - depth: for newLine formatting, indentation depth to start from (default: 0)
	 * - definitions: for defined types (relationships and data types) use the model definition form (default: true)
	 * - typePrefix: prefix to use for types (defaults to 'R1T.')
	 * - relationshipPrefix: prefix to use for relationships (defaults to 'R1R.')
	 */
	toTemplateString (options) {
		if (options === undefined)
			options = {};
		let nln = options.newLine === false ? " " : "\n";
		let ind = options.indentation === undefined ? 4 : options.indentation;
		let dpt = options.depth === undefined ? 0 : options.depth;
		let def = options.definitions === undefined ? true : options.definitions;
		let tpr = options.typePrefix === undefined ? "R1T." : options.typePrefix;
		let rpr = options.relationshipPrefix === undefined ? "R1R." : options.relationshipPrefix;
		let ia = util.indentationArray(ind);

		let opts = JSON.parse(JSON.stringify(options));
		opts.depth = dpt + 1;

		let ret = [];

		ret.push(ia[dpt+1] + util.kvPair("name", this.name, false, true));
		if (this.owner)
			ret.push(ia[dpt+1] + util.kvPair("ownership", this.owner.toTemplateString(opts)));
		ret.push(ia[dpt+1] + util.kvPair("id", this.id.toTemplateString(opts)));

		opts.depth = dpt + 2;
		let nested;

		if (this.attributes && this.attributes.length) {
			nested = [];
			for (let i=0; i<this.attributes.length; i++)
				nested.push(ia[dpt+2] +
					util.kvPair(this.attributes[i].getName(), this.attributes[i].toTemplateString(opts)));
			ret.push(ia[dpt+1] + util.kvPair("attributes", "{" + nln + nested.join(nln) + nln + ia[dpt+1] + "}"));
		}

		if (this.relationships && this.relationships.length) {
			nested = [];
			for (let i=0; i<this.relationships.length; i++)
				nested.push(ia[dpt+2] +
					util.kvPair(this.relationships[i].getName(), this.relationships[i].toTemplateString(opts)));
			ret.push(ia[dpt+1] + util.kvPair("relationships", "{" + nln + nested.join(nln) + nln + ia[dpt+1] + "}"));
		}

		ret = ia[dpt] + "{" + nln + ret.join("," + nln) + nln + ia[dpt] + "}";

		return ret;
	}

}

/* Static configuration values for class */
/* Maybe in the future it makes sense to use a factory pattern */

Model.STRINGS = {
	OWNED: "owned_"
};

module.exports = Model;
