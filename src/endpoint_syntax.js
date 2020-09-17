const Model = require("./model.js");
const Primitive = require("./types.js").Primitive;
const Property = require("./property.js");

const Nouns = {
	search: "s"
};

const Verbs = {
	is: "is",
	lessThan: "lessThan",
	moreThan: "moreThan",
	between: "between",
	before: "before",
	after: "after",
	startsWith: "startsWith",
	endsWith: "endsWith",
	contains: "contains",
	has: "has"
};

class Keyword {

	constructor (noun, verb, type, len) {
		this.noun = noun;
		this.verb = verb;
		this.type = type;
		if (len && len > 1) {
			this.array = true;
			this.length = len;
		}
		else
			this.array = false;
		this.computePathLength();
	}

	computePathLength () {
		let ret = 0;
		if (this.noun)
			ret++;
		if (this.verb)
			ret++;
		if (this.array)
			ret += this.length;
		else
			ret++;
		this.pathLength = ret;
		return ret;
	}

	getPathLength () {
		return this.pathLength;
	}

}

Keyword.fromProperty = function (property) {
	let ret = [];
	let noun = property.getName();
	let type = property.getType();
	let primitive = type.getPrimitive();

	// add direct access for enumerable properties
	if (type.isEnumerable()) {
		if (type.isFragmentable()) {
			ret.push(new Keyword(noun, Verbs.is, primitive));
			ret.push(new Keyword(noun, Verbs.startsWith, primitive));
			ret.push(new Keyword(noun, Verbs.endsWith, primitive));
			ret.push(new Keyword(noun, Verbs.contains, primitive));
		}
		ret.push(new Keyword(noun, null, primitive));
	}

	// add comparison verbs for comparable properties
	if (type.isComparable()) {
		if (primitive.name === "DATE") {
			ret.push(new Keyword(noun, Verbs.before, primitive));
			ret.push(new Keyword(noun, Verbs.after, primitive));
		}
		else {
			ret.push(new Keyword(noun, Verbs.lessThan, primitive));
			ret.push(new Keyword(noun, Verbs.moreThan, primitive));
		}
		ret.push(new Keyword(noun, Verbs.between, primitive, 2));
		ret.push(new Keyword(noun, null, primitive));
	}

	// add absent value checker for absent value properties
	if (type.hasAbsentValue())
		ret.push(new Keyword(noun, Verbs.has, primitive));

	return ret;
};

class EndpointSyntax {

	constructor (model) {
		this.keywords = {};
		this.pathLength = 0;
		this.pathString = "";
		if (model instanceof Model)
			this.fromModel(model);
	}

	fromModel (model) {
	}

	addKeyword (noun, verb, type, len) {
		if (this.keywords[noun] === undefined)
			this.keywords[noun] = [];
		this.keywords[noun].push(new Keyword(noun, verb, type, len));
	}

	addKeywordsFromProperty (property) {
		let kw = Keyword.fromProperty(property);
		let noun = property.getName();
		if (this.keywords[noun] === undefined)
			this.keywords[noun] = [];
		this.keywords[noun] = this.keywords[noun].concat(kw);
	}

	computePathLength () {
		let ret = 0;
		for (let i in this.keywords) {
			let max = 0;
			for (let j=0; j<this.keywords[i].length; j++)
				if (max < this.keywords[i][j].getPathLength())
					max = this.keywords[i][j].getPathLength();
			ret += max;
		}
		this.pathLength = ret;
		return ret;
	}

	computePathString () {
		let ret = "";
		for (let i=0; i<this.pathLength; i++)
			ret += "/:p" + i + "?";
		this.pathString = ret;
		return ret;
	}

	computePath () {
		this.computePathLength();
		this.computePathString();
	}

	getPathLength () {
		return this.pathLength;
	}

	getPathString () {
		return this.pathString;
	}

}

class ListSyntax extends EndpointSyntax {

	constructor (model) {
		super (model);
	}

	fromModel (model) {
		let attr = model.getAttributes();
		let hasSearchable = false;
		for (let i=0; i<attr.length; i++) {
			this.addKeywordsFromProperty(attr[i]);
			if (attr[i].getType().isSearchable())
				hasSearchable = true;
		}
		if (hasSearchable)
			this.keywords[Nouns.search] = new Keyword(Nouns.search, null, Primitive.STRING);
		this.computePath();
	}

}

module.exports.EndpointSyntax = EndpointSyntax;
module.exports.ListSyntax = ListSyntax;
module.exports.Nouns = Nouns;
module.exports.Verbs = Verbs;
