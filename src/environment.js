const Endpoint = require("./endpoint.js");
const EndpointHandler = require("./endpoint_handler.js").EndpointHandler;
const EndpointHandlerSet = require("./endpoint_handler.js").EndpointHandlerSet;
const Model = require("./model.js");
const ModelLoader = require("./model_loader.js");

class Environment {

	constructor (config) {
		this.modelLoader = new ModelLoader();
		this.handlers = {};
		this.setDefaultHandlerClass();
	}

	loadModels (models) {
		this.modelLoader.loadModels(models);
	}

	setDefaultHandlerClass () {
		this.handlerClass = EndpointHandler;
	}

	setHandlerClass (HandlerClass) {
		this.handlerClass = HandlerClass;
	}

	setHandlerSet (entity, handlerSet) {
		this.handlers[entity] = handlerSet;
	}

	generateHandlers (entities) {
		if (!entities)
			entities = this.getEntityNames();
		for (let i=0; i<entities.length; i++) {
			this.handlers[entities[i]] = new EndpointHandlerSet(entities[i], this.handlerClass);
		}
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
		let handlerSet = this.handlers[model.getName()];
		if (!handlerSet)
			return null; // TODO: throw
		let ret = {
			create:		new Endpoint(Endpoint.Type.CREATE,		entity, handlerSet),
			retrieve:	new Endpoint(Endpoint.Type.RETRIEVE,	entity, handlerSet),
			update:		new Endpoint(Endpoint.Type.UPDATE,		entity, handlerSet),
			delete:		new Endpoint(Endpoint.Type.DELETE,		entity, handlerSet),
			list:		new Endpoint(Endpoint.Type.LIST,		entity, handlerSet)
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

	getEndpointPaths (entities) {
		let list = this.getEndpointList(entities);
		let ret = {};
		for (let i in list) {
			ret[i] = {};
			for (let j in list[i])
				ret[i][j] = list[i][j].method + " " + list[i][j].path;
		}
		return ret;
	}

	applyEntityPaths (app, endpoint) {
		if (!endpoint)
			endpoint = this.getEntityEndpoints(name);
		for (let i in endpoint) {
			endpoint[i].applyToApp(app);
		}
	}

	applyAllEntityPaths (app, entities) {
		let list = this.getEndpointList(entities);
		for (let i in list) {
			this.applyEntityPaths(app, list[i]);
		}
	}

}

module.exports = Environment;
