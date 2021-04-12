import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";

import {API_ACCESS_TOKENS} from "../config.js";

const PORT = 1234;

export default class Server {
	
	constructor(printer){
		this.dirname = import.meta.url.split(":")[1];
		this.printer = printer;
		this.app = express();
		this.upload = multer();
		this.registerAppListeners();
	}

	registerAppListeners(){
		this.app.use(express.static(path.normalize(this.dirname + "/../../web/build")));
		this.app.use(express.json());
		this.app.use(cors());

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

		this.app.post("/api/print_text", async (req, res) => {
			if(!this.validateAuth(req.headers.authorization)) {
				res.status(401).end();
				return;
			}
			if(req.headers["content-type"] !== "application/json"){
				res.status(400).send("Content-Type header must be set to `application/json`");
				return;
			}

			const body = req.body;
			if(body == null){
				res.status(400).send("No JSON body provided");
				return;
			}
			if(!("text" in body)){
				res.status(400).send("No `text` field in body provided.");
				return;
			}
			if((typeof body.text) !== "string"){
				res.status(400).send("Text field is not of type `string`");
				return;
			}

			try {
				await this.printer.printString(body.text);
			} catch(e) {
				console.error(e);
				res.status(500).end();
				return;
			}
			res.status(200).end();
		});

		this.app.post("/api/send_file", this.upload.single("file"), async (req, res) => {
			if(!this.validateAuth(req.headers.authorization)) {
				res.status(401).end();
				return;
			}

			// if(req.headers["content-type"] !== "multipart/form-data"){
			// 	res.status(400).send("Content-Type header must be set to `multipart/form-data`");
			// 	return;
			// }
			const file = req.file;
			if(file == null){
				res.status(400).send("No file present in body.");
				return;
			}
			const extension = path.extname(file.originalname);
			try {
				await this.printer.printImageFromBuffer(file.buffer, extension);
			} catch(e) {
				console.error(e);
				res.status(500).end();
				return;
			}
			res.status(200).end();
		});

		this.app.get("/api/*", (req, res) => {
			res.status(404).end();
		});
	}

	/**
	 * Checks whether an authentication header is valid.
	 * @param {string} authHeader The Authentication header value passed with the HTTP request.
	 * @returns {boolean} True if the authentication is a valid token, false otherwise.
	 */
	validateAuth(authHeader){
		if(authHeader == undefined || authHeader == null){
			console.warn("Validate auth failed: token is null or undefined");
			return false;
		}
		if(!authHeader.startsWith("Bearer")){
			console.warn("Validate auth failed: token type is not 'Bearer'");
			return false;
		}
		const split = authHeader.split(" ");
		if(split.length < 2){
			console.warn("Validate auth failed: less than two space-delimited sections");
			return false;
		}
		const token = split[1].trim();
		if(!API_ACCESS_TOKENS.includes(token)){
			console.warn(`Validate auth failed: token "${token}" is not in valid token list`);
			return false;
		}
		return true;
	}
}