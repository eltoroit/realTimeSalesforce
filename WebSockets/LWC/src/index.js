import WS from "./webserver.js";
import * as dotenv from "dotenv";
dotenv.config();

if (process.env.DYNO) {
	console.log(`Running on Heroku dyno: ${process.env.DYNO}`);
} else {
	console.log(`Running locally`);
}

(async () => {
	const ws = new WS();
	await ws.createServer();
})();
