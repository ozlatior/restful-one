const Model = require("./model.js");
const R1R = require("./types.js").Relationship;

class ModelLoader {

	constructor (models, autoReverse) {
		this.autoReverse = autoReverse !== undefined ? autoReverse : true;
		this.models = [];
		if (models)
			this.loadModels(models);
	}

	addModel (model) {
		// if not an actual model, try to create one
		if (!(model instanceof Model))
			model = new Model(model);
		// create relationships
		if (this.autoReverse)
			model.createReverseRelationships(this.models);
		// insert the model
		this.models.push(model);
	}

	loadModels (models) {
		if (models instanceof Model)
			models = [ models ];
		for (let i in models)
			this.addModel(models[i]);
	}

	getModels () {
		return this.models;
	}

	getModelNames () {
		let ret = [];
		for (let i=0; i<this.models.length; i++)
			ret.push(this.models[i].getName());
		return ret;
	}

	getModelByName (name) {
		for (let i=0; i<this.models.length; i++)
			if (this.models[i].getName() === name)
				return this.models[i];
		return null;
	}

	getModelKeys () {
		let ret = {};
		for (let i=0; i<this.models.length; i++) {
			ret[this.models[i].getName()] = this.models[i].getKeys();
		}
		return ret;
	}

	logRelationships (logfn) {
		if (!logfn)
			logfn = console.log;
		logfn("Logging relationships");
		if (!this.models || !this.models.length)
			return logfn("No Model objects loaded in ModelLoader");
		logfn("Log relatioships for " + this.models.length + " Model objects");
		for (let i=0; i<this.models.length; i++)
			this.models[i].logRelationships(this.models, logfn);
	}

}

module.exports = ModelLoader;
