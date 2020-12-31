import express from "express";
import path from "path";

import {API_ACCESS_TOKENS} from "../secrets.js";

const PORT = 1234;

export default class Server {

	constructor(printer){
		this.dirname = import.meta.url.split(":")[1];
		this.printer = printer;
		this.app = express();
		this.registerAppListeners();
	}

	registerAppListeners(){
		this.app.use(express.static(path.normalize(this.dirname + "/../../web/build")));

		this.registerAPIListeners();

		this.app.get("*", (req, res) => {
			// Rewrite any other pages to index.html
			res.sendFile(path.normalize(this.dirname + "/../../web/build/index.html"));
		});

		this.app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}!`);
		});
	}

	registerAPIListeners(){
		// TODO
		// this.app.get("/api/foo/:bar", (req, res) => {});

		this.app.get("/api/*", (req, res) => {
			res.status(404).end();
		})
	}
}