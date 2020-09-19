const util = require("./util.js");

class EndpointHandler {

	constructor (entity, action, config) {
		this.entity = entity;
		this.action = action;
		this.syntax = null;
	}

	setSyntaxHandler (syntax) {
		this.syntax = syntax;
	}

	before () {
		return (req, res, next) => {
			req.api = {
				entity: this.entity,
				action: this.action
			};
			if (req.params && req.params.id)
				req.api.id = req.params.id;
			if (this.syntax) {
				req.api.params = {};
				this.syntax.extractParams(req.params, req.api.params);
			}
			next();
		};
	}

	handle () {
		return (req, res) => {
			let out = "<div>Default Endpoint Handler for " + this.entity + " / " + this.action + "</div>";
			out += util.objectToHtml(req.api, true);
			res.send(out);
		};
	}

}

class EndpointHandlerSet {

	constructor (entity, HandlerClass, config) {
		this.entity = entity;
		if (HandlerClass) {
			this.create =	new HandlerClass(entity, "create", config);
			this.retrieve = new HandlerClass(entity, "retrieve", config);
			this.update =	new HandlerClass(entity, "update", config);
			this.delete =	new HandlerClass(entity, "delete", config);
			this.list =		new HandlerClass(entity, "list", config);
		}
		else {
			this.create = null;
			this.retrieve = null;
			this.update = null;
			this.delete = null;
			this.list = null;
		}
	}

	setHandler (action, handler) {
		this[action] = handler;
	}

}

module.exports.EndpointHandler = EndpointHandler;
module.exports.EndpointHandlerSet = EndpointHandlerSet;
