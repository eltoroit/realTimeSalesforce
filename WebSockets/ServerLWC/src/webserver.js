import fs from "fs";
import http from "http";
import https from "https";
import express from "express";
import { Server } from "socket.io";

export default class Webserver {
	io;
	app;

	async createServer() {
		this.app = express();
		this.app.set("view engine", "ejs");
		this.app.use(express.static("public"));
		this.allowExpressCORS();
		await this.makeHTTP();
		// if (!process.env.HEROKU_APP_NAME) {
		// 	await this.makeHTTPS();
		// }
		this.routes();
	}
	makeHTTP() {
		return new Promise((resolve, reject) => {
			const httpServer = http.createServer(this.app);
			this.makeSocketio({ httpServer });

			const HTTP_PORT = process.env.PORT || process.env.HTTP_PORT_LOCAL;
			let serverURL = "";
			if (process.env.HEROKU_APP_NAME) {
				serverURL = `https://et-realtimesf-basicws-6b1e66624e2a.herokuapp.com`;
			} else {
				serverURL = `http://localhost:${HTTP_PORT}`;
			}
			httpServer.listen(HTTP_PORT, () => {
				console.log(`HTTP Server running at: ${serverURL}/`);
				resolve();
			});
		});
	}
	makeHTTPS() {
		return new Promise((resolve, reject) => {
			const certs = {
				key: fs.readFileSync("certs/server.key"),
				cert: fs.readFileSync("certs/server.cert"),
			};

			const httpsServer = https.createServer(certs, this.app);
			this.makeSocketio({ httpServer: httpsServer });
			httpsServer.listen(process.env.HTTPS_PORT_LOCAL, () => {
				console.log(`HTTPS Server running at: https://localhost:${process.env.HTTPS_PORT_LOCAL}/`);
				resolve();
			});
		});
	}
	makeSocketio({ httpServer }) {
		this.io = new Server(httpServer, {
			/* options */
			cors: this.allowSocketioCORS(),
		});
		this.io.on("connection", (socket) => {
			this.ioconn(socket);
		});
	}

	ioconn(socket) {
		console.log("SocketIO: New Connection", socket.id);

		// receive a message from the client
		socket.on("PING", (data) => {
			data.pong = new Date().toJSON();
			console.log("SocketIO: Received", data);
			this.io.emit("PONG", data);
			console.log("SocketIO: Published", data);
		});
	}

	allowExpressCORS() {
		this.app.use((req, res, next) => {
			// console.log("CORS: Web");
			res.header("Access-Control-Allow-Origin", req.get("Origin") || "*");
			res.header("Access-Control-Allow-Credentials", "true");
			res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
			res.header("Access-Control-Expose-Headers", "Content-Length");
			res.header("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-Requested-With, Range");
			if (req.method === "OPTIONS") {
				return res.sendStatus(200);
			} else {
				return next();
			}
		});
	}

	allowSocketioCORS() {
		return {
			// Access-Control-Allow-Origin
			origin: (origin, callback) => {
				// console.log("CORS: Socket.io");
				const isValid = true;
				if (isValid) {
					// Valid Origin
					return callback(null, true);
				} else {
					// Invalid origin
					return callback(new Error("Invalid Origin"), false);
				}
			},
			// Access-Control-Allow-Methods
			methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
			// Access-Control-Allow-Headers
			allowedHeaders: "Accept, Authorization, Content-Type, X-Requested-With, Range",
			// Access-Control-Expose-Headers
			exposedHeaders: "Content-Length",
			// Access-Control-Allow-Credentials
			credentials: "true",
		};
	}

	routes() {
		this.app.get("/", (req, res) => {
			res.render("pages/socketio", { ioserver: process.env.ioserver });
		});
	}
}
