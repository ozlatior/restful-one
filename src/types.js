const uuid = require("uuid/v4");

const UUID_LEN = 128;
const CIDR_LEN = 128;
const INET_LEN = 128;
const MACA_LEN = 128;

const Relationship = {
	ONE_TO_ONE: 0,
	ONE_TO_MANY: 1,
	MANY_TO_ONE: 2,
	MANY_TO_MANY: 3
};

const Primitive = {
	BOOLEAN: (a) => typeof(a) === "boolean",
	NUMBER: (a) => typeof(a) === "number",
	STRING: (a) => typeof(a) === "string",
	OBJECT: (a) => typeof(a) === "object",
	DATE: (a) => (typeof(a) === "object") && (a instanceof Date)
};

class DataType {

	constructor () {
		this.type = null;
		this.primitive = null;
		this.properties = {
			enumerable: false,
			comparable: false,
			searchable: false,
			fragmentable: false,
			absentValue: null
		};
	}

	applyProperties (p) {
		for (let i in p)
			this.properties[i] = p[i];
	}

	isEnumerable () {
		return this.properties.enumerable;
	}

	isComparable () {
		return this.properties.comparable;
	}

	isSearchable () {
		return this.properties.searchable;
	}

	isFragmentable () {
		return this.properties.fragmentable;
	}

	hasAbsentValue () {
		return (this.properties.absentValue !== null);
	}

	getDefault () {
		return null;
	}

	isValid (value) {
		if (this.primitive !== null)
			return this.primitive(value);
		return false;
	}

	isAbsent (value) {
		return (this.properties.absentValue !== null) && (this.properties.absentValue === value);
	}

	isValidString (value) {
		return null;
	}

	makeValid (value) {
		return null;
	}

	fromString (value) {
		return null;
	}

	toString (value) {
		return null;
	}

	serialize () {
		return this.constructor.name + "/" + this.name + "/" + this.type;
	}

}

class NumberType extends DataType {

	constructor (min, max, mul) {
		super ();
		this.type = "number";
		this.primitive = Primitive.NUMBER;
		this.properties.comparable = true;
		this.min = min !== undefined ? min : -Infinity;
		this.max = max !== undefined ? max : +Infinity;
		this.mul = mul !== undefined ? mul : 1;	// TODO: not implemented
	}

	getDefault () {
		return 0;
	}

	isValid (value) {
		if (!super.isValid(value))
			return false;
		if (typeof(value) !== "number")
			return false;
		if (value < this.min || value > this.max)
			return false;
		return true;
	}

	isValidString (value) {
		if (parseFloat(value) + "" !== value)
			return false;
		return this.isValid(value);
	}

	makeValid (value) {
		value = parseFloat(value);
		if (value < min)
			value = min;
		if (value > max)
			value = max;
		return value + "";
	}

	fromString (value) {
		return parseFloat(value);
	}

	toString (value) {
		return value + "";
	}

	serialize () {
		return super.serialize() + " " + JSON.stringify({ min: this.min, max: this.max, mul: this.mul });
	}

}

// TODO: proper float implementation

class FloatType extends NumberType {
}

class FLOAT extends FloatType {
}

class REAL extends FloatType {
}

class DOUBLE extends FloatType {
}

class DECIMAL extends FloatType {
}

class IntegerType extends NumberType {

	isValid (value) {
		if (!super.isValid(value))
			return false;
		if (value !== parseInt(value))
			return false;
		return true;
	}

	makeValid (value) {
		value = parseInt(value);
		if (value < min)
			value = min;
		if (value > max)
			value = max;
		return value + "";
	}

	fromString (value) {
		return parseInt(value);
	}

}

class INTEGER extends IntegerType {

	constructor (max) {
		super (-max, max);
		this.name = "INTEGER";
	}

}

class BIGINT extends INTEGER {

	constructor (max) {
		super (max);
		this.name = "BIGINT";
	}

}

class SMALLINT extends INTEGER {

	constructor (max) {
		super (max);
		this.name = "SMALLINT";
	}

}

class TINYINT extends INTEGER {

	constructor (max) {
		super (max);
		this.name = "TINYINT";
	}

}

class BooleanType extends DataType {

	constructor () {
		super ();
		this.type = "boolean";
		this.primitive = Primitive.BOOLEAN;
		this.properties.enumerable = true;
		this.values = [ "0", "1", "f", "t", "false", "true" ];
	}

	getDefault () {
		return false;
	}

	isValidString (value) {
		return this.values.indexOf(value.toLowerCase()) !== -1;
	}

	makeValid (value) {
		return !!value;
	}

	fromString (value) {
		value = value.toLowerCase();
		switch (value) {
			case "0":
			case "f":
			case "false":
				return false;
			case "1":
			case "t":
			case "true":
				return true;
		}
	}

	toString (value) {
		return !!value + "";
	}

}

class BOOLEAN extends BooleanType {

	constructor () {
		super ();
		this.name = "BOOLEAN";
	}

}

class StringType extends DataType {

	constructor (len, encoding) {
		super ();
		this.type = "string";
		this.primitive = Primitive.STRING;
		this.properties.enumerable = true;
		this.properties.searchable = true;
		this.properties.fragmentable = true;
		this.maxlen = len ? len : 255;
		this.encoding = encoding;	// TODO: implement binary and other encoding
	}

	getDefault () {
		return "";
	}

	isValid (value) {
		if (!super.isValid(value))
			return false;
		return value.length <= this.maxlen;
	}

	isValidString (value) {
		return this.isValid(value);
	}

	makeValid (value) {
		return (value + "").slice(0, this.maxlen);
	}

	fromString (value) {
		return this.value;
	}

	toString (value) {
		return this.value;
	}

	serialize () {
		return super.serialize() + " " + JSON.stringify({ maxlen: this.maxlen, encoding: this.encoding });
	}

}

class STRING extends StringType {

	constructor (len) {
		super (len);
		this.name = "STRING";
	}

}

class BINARY extends StringType {

	// TODO: implement this
	constructor (len) {
		super (len);
		this.name = "BINARY";
	}

}

class TEXT extends StringType {

	constructor (tiny) {
		if (tiny === "tiny")
			tiny = true;
		super (tiny ? 255 : 65535);
		this.name = tiny ? "TINYTEXT" : "TEXT";
	}

}

class TINYTEXT extends TEXT {

	constructor () {
		super(true);
	}

}

class CITEXT extends TEXT {

	constructor () {
		super();
		this.name = "CITEXT";
	}

}

class BLOB extends StringType {

	constructor (tiny) {
		if (tiny === "tiny")
			tiny = true;
		// call with binary encoding
		super (tiny ? 255 : 65535);
		this.name = tiny ? "TINYBLOB" : "BLOB";
	}

}

class TINYBLOB extends BLOB {

	constructor () {
		super(true);
	}

}

class UUID extends StringType {

	constructor () {
		super (UUID_LEN);
		this.name = "UUID";
	}

	getDefault () {
		return uuid();
	}

}

class CIDR extends StringType {

	constructor () {
		super (CIDR_LEN);
		this.name = "CIDR";
	}

}

class INET extends StringType {

	constructor () {
		super (INET_LEN);
		this.name = "INET";
	}

}

class MACADDR extends StringType {

	constructor () {
		super (MACA_LEN);
		this.name = "MACADDR";
	}

}

STRING.BINARY = BINARY;

// TODO: extend object type to implement arrays, JSON, enumerations, etc
class ObjectType extends DataType {

	constructor (schema) {
		super ();
		this.schema = schema;	// TODO: implement schema for objects
	}

}

class ArrayType extends ObjectType {
}

class DateType extends DataType {

	constructor (date, time) {
		super ();
		this.type = "date";
		this.primitive = Primitive.DATE;
		this.properties.comparable = true;
		this.properties.searchable = true;
		this.date = date === undefined ? true : date;
		this.time = time === undefined ? true : time;
	}

	getDefault () {
		return new Date();
	}

	isValidString (value) {
		let d = new Date(value);
		return !(isNaN(d.getTime()));
	}

	fromString (value) {
		return new Date(value);
	}

	toString (value) {
		return value.toISOString();
	}

	serialize () {
		return super.serialize() + " " + JSON.stringify({ date: this.date, time: this.time });
	}

}

class DATETIME extends DateType {

	constructor () {
		super (true, true);
		this.name = "DATETIME";
	}

}

class DATEONLY extends DateType {

	constructor () {
		super (true, false);
		this.name = "DATEONLY";
	}

}

class TIMEONLY extends DateType {

	constructor () {
		super (false, true);
		this.name = "TIMEONLY";
	}

}

const Types = {

	STRING: (len) => new STRING(len),
	BINARY: (len) => new BINARY(len),
	TEXT: (t) => new TEXT(tiny),
	TINYTEXT: () => new TINYTEXT(),
	CITEXT: () => new CITEXT(),
	INTEGER: (max) => new INTEGER(max),
	BIGINT: (max) => new BIGINT(max),
	FLOAT: (min, max) => new FLOAT(min, max),
	REAL: (min, max) => new REAL(min, max),
	DOUBLE: (min, max) => new DOUBLE(min, max),
	DATETIME: () => new DATETIME(),
	DATEONLY: () => new DATEONLY(),
	TIMEONLY: () => new TIMEONLY(),
	BOOLEAN: () => new BOOLEAN(),
	ENUM: null,
	ARRAY: null,
	JSON: null,
	JSONB: null,
	BLOB: (tiny) => new BLOB(tiny),
	TINYBLOB: () => new TINYBLOB(),
	UUID: () => new UUID(),
	CIDR: () => new CIDR(),
	INET: () => new INET(),
	MACADDR: () => MACADDR(),
	RANGE: null,
	GEOMETRY: null

};

const Calls = {

	STRING: { maxlen: 255 },
	BINARY: { maxlen: 255 },
	TEXT: {},
	TINYTEXT: {},
	CITEXT: {},
	INTEGER: { max: Infinity },
	BIGINT: { max: Infinity },
	FLOAT: { min: -Infinity, max: Infinity },
	REAL: { min: -Infinity, max: Infinity },
	DOUBLE: { min: -Infinity, max: Infinity },
	DATETIME: {},
	DATEONLY: {},
	TIMEONLY: {},
	BOOLEAN: {},
	ENUM: {},
	ARRAY: {},
	JSON: {},
	JSONB: {},
	BLOB: {},
	TINYBLOB: {},
	UUID: {},
	CIDR: {},
	INET: {},
	MACADDR: {},
	RANGE: {},
	GEOMETRY: {}

};

const getCall = function (type) {
	let call = type.constructor.name;
	let ret = call + "(";
	let args = [];
	call = Calls[call];
	let lastDefault = -1;
	for (let i in call) {
		args.push(type[i]);
		if (type[i] === call[i])
			lastDefault = args.length-1;
	}
	if (lastDefault !== -1)
		args = args.slice(0, lastDefault);
	ret += args.join(", ");
	ret += ")";
	return ret;
};

module.exports.Relationship = Relationship;
module.exports.Primitive = Primitive;
module.exports.DataType = DataType;
module.exports.Types = Types;
module.exports.Calls = Calls;

module.exports.getCall = getCall;

module.exports.NumberType = NumberType;
module.exports.FloatType = FloatType;
module.exports.IntegerType = IntegerType;
module.exports.BooleanType = BooleanType;
module.exports.StringType = StringType;
module.exports.ObjectType = ObjectType;
module.exports.ArrayType = ArrayType;
module.exports.DateType = DateType;
