const Endpoint = require("./endpoint.js");
const Model = require("./model.js");
const ModelLoader = require("./model_loader.js");

class Environment {

	constructor (config) {
		this.modelLoader = new ModelLoader();
	}

	loadModels (models) {
		this.modelLoader.loadModels(models);
	}

	getModelLoader () {
		return this.modelLoader;
	}

	getEntityNames () {
		return this.modelLoader.getModelNames();
	}

	getEntityEndpoints (entity) {
		let model;
		if (entity instanceof Model)
			model = entity;
		else
			model = this.modelLoader.getModelByName(entity);
		if (!model)
			return null;
		let ret = {
			create:		new Endpoint(Endpoint.Type.CREATE,		entity, {}),
			retrieve:	new Endpoint(Endpoint.Type.RETRIEVE,	entity, {}),
			update:		new Endpoint(Endpoint.Type.UPDATE,		entity, {}),
			delete:		new Endpoint(Endpoint.Type.DELETE,		entity, {}),
			list:		new Endpoint(Endpoint.Type.LIST,		entity, {})
		};
		return ret;
	}

	getEndpointList (entities) {
		if (!entities)
			entities = this.getEntityNames();
		let ret = {};
		for (let i=0; i<entities.length; i++)
			ret[entities[i]] = this.getEntityEndpoints(this.modelLoader.getModelByName(entities[i]));
		return ret;
	}

}

module.exports = Environment;
