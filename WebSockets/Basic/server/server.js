import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
	let url = new URL("./index.html", import.meta.url).pathname;
	res.sendFile(url.replace("%20", " "));
});

io.on("connection", (socket) => {
	console.log(`${socket.id} connected`);
	socket.on("disconnect", () => {
		console.log(`${socket.id} disconnected`);
	});
	socket.on("chat message", (msg) => {
		console.log("message: " + msg);
		io.emit("chat message", msg);
	});
});

server.listen(3000, () => {
	console.log("server running at http://localhost:3000");
});
