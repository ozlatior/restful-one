const inflection = require("inflection");

const ListSyntax = require("./endpoint_syntax.js").ListSyntax;

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
		handler: (h) => h.create,
		syntax: () => null
	},
	RETRIEVE: {
		name: "retrieve",
		method: Method.GET,
		path: (model) => "/" + model.getName() + "/:id",
		handler: (h) => h.retrieve,
		syntax: () => null
	},
	UPDATE: {
		name: "update",
		method: Method.PATCH,
		path: (model) => "/" + model.getName() + "/:id",
		handler: (h) => h.update,
		syntax: () => null
	},
	DELETE: {
		name: "delete",
		method: Method.DELETE,
		path: (model) => "/" + model.getName() + "/:id",
		handler: (h) => h.delete,
		syntax: () => null
	},
	LIST: {
		name: "list",
		method: Method.GET,
		path: (model) => "/" + inflection.pluralize(model.getName()) + "<SYNTAX>",
		handler: (h) => h.list,
		syntax: (model) => new ListSyntax(model)
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
		this.syntax = type.syntax(model);

		if (this.syntax) {
			this.path = this.path.replace("<SYNTAX>", this.syntax.getPathString());
			this.handler.setSyntaxHandler(this.syntax);
		}
	}

	getEndpointFn (app) {
		switch (this.method) {
			case "GET":
				return app.get.bind(app);
			case "POST":
				return app.post.bind(app);
			case "PUT":
				return app.put.bind(app);
			case "PATCH":
				return app.patch.bind(app);
			case "DELETE":
				return app.delete.bind(app);
		}
		return null;
	}

	applyToApp (app) {
		let fn = this.getEndpointFn(app);
		fn(this.path, this.handler.before());
		fn(this.path, this.handler.handle());
	}

}

Endpoint.Method = Method;
Endpoint.Type = Type;

module.exports = Endpoint;
