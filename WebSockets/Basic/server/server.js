import http from "http";
import express from "express";
import { Server } from "socket.io";

export default class WebSockets {
	io;
	app;

	async initializeServer() {
		this.app = express();
		this.app.set("view engine", "ejs");
		this.app.use(express.static("public"));
		const httpServer = http.createServer(this.app);
		this.io = new Server(httpServer);

		this.io.on("connection", (socket) => {
			console.log(`${socket.id} connected`);
			socket.on("disconnect", () => {
				console.log(`${socket.id} disconnected`);
			});
			socket.on("chat message", (msg) => {
				console.log("message: " + msg);
				this.io.emit("chat message", msg);
			});
		});

		this.app.get("/", (req, res) => {
			res.render("pages/index");
		});

		httpServer.listen(3000, () => {
			console.log("server running at http://localhost:3000");
		});
	}
}

let ws = new WebSockets();
ws.initializeServer();
