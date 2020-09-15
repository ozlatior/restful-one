const inflection = require("inflection");

const Method = {
	GET: {
		name: "GET"
	},
	POST: {
		name: "POST"
	},
	PUT: {
		name: "PUT"
	},
	PATCH: {
		name: "PATCH"
	},
	DELETE: {
		name: "DELETE"
	}
};

const Type = {
	CREATE: {
		name: "create",
		method: Method.PUT,
		path: (model) => "/" + model.getName(),
		handler: (h) => h.create
	},
	RETRIEVE: {
		name: "retrieve",
		method: Method.GET,
		path: (model) => "/" + model.getName() + "/:id",
		handler: (h) => h.retrieve
	},
	UPDATE: {
		name: "update",
		method: Method.PATCH,
		path: (model) => "/" + model.getName() + "/:id",
		handler: (h) => h.update
	},
	DELETE: {
		name: "delete",
		method: Method.DELETE,
		path: (model) => "/" + model.getName() + "/:id",
		handler: (h) => h.delete
	},
	LIST: {
		name: "list",
		method: Method.GET,
		path: (model) => "/" + inflection.pluralize(model.getName()) + "/" + "<FILTERS>",
		handler: (h) => h.list
	}
};

class Endpoint {

	constructor (type, model, handler) {
		this.entity = model.getName();
		this.model = model;
		this.action = type.name;
		this.method = type.method.name;
		this.path = type.path(model);
		this.handler = type.handler(handler);
	}

}

Endpoint.Method = Method;
Endpoint.Type = Type;

module.exports = Endpoint;
