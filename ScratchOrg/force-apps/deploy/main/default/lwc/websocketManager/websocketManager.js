import Utils from "c/utils";
import ET_Asserts from "c/etAsserts";
import { LightningElement, api } from "lwc";
import getServer from "@salesforce/apex/Data.getServer";
import srQuestions from "@salesforce/resourceUrl/Questions";
// If LWC is in DigitalExperience/LWR, then lightning/platformResourceLoader does not work.
// https://developer.salesforce.com/docs/atlas.en-us.exp_cloud_lwr.meta/exp_cloud_lwr/template_limitations.htm
// 		Scripts loaded through lightning/platformResourceLoader run in an LWS sandbox.
//		To use lightning/platformResourceLoader in an LWR site, you must implement your own loadScript function
// import { loadScript } from "c/resourceLoader";
// await loadScript(`${srQuestions}/socket.io.js`);
import { loadScript } from "lightning/platformResourceLoader";
// await loadScript(`${srQuestions}/socket.io.js`);

export default class WebsocketManager extends LightningElement {
	socket;
	serverURL;
	initialized = false;

	async connectedCallback() {
		try {
			await loadScript(this, `${srQuestions}/socket.io.js`);
		} catch (ex) {
			debugger;
		}
		try {
			this.serverURL = await getServer();
			this.socket = window.io(this.serverURL);
			this.connection();
			this.listen();
			this.initialized = true;
		} catch (ex) {
			Utils.logger.error(ex);
			this.dispatchEvent(
				new CustomEvent("iostatus", {
					bubbles: true,
					composed: true,
					detail: { message: "Can't initialize Socket.io (1)", status: "ERROR", color: "red" }
				})
			);
			debugger;
		}
	}

	@api publish({ eventName, payload }) {
		ET_Asserts.hasData({ value: payload, message: "payload" });
		ET_Asserts.hasData({ value: eventName, message: "eventName" });

		this.socket.emit(eventName, payload);
	}

	connection() {
		let message;
		this.socket.on("connect", () => {
			const engine = this.socket.io.engine;
			// In most cases, prints "polling"
			message = `Socket.io | Connected using ${engine.transport.name}`;
			this.dispatchEvent(
				new CustomEvent("iostatus", { bubbles: true, composed: true, detail: { message, status: "CONNECTED", color: "yellow" } })
			);

			engine.once("upgrade", () => {
				// called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket), in most cases, prints "websocket"
				message = `Socket.io | Connection upgraded to ${engine.transport.name}`;
				this.dispatchEvent(
					new CustomEvent("iostatus", { bubbles: true, composed: true, detail: { message, status: "UPGRADED", color: "green" } })
				);
			});

			engine.on("close", (...args) => {
				message = `Socket.io | Connection lost`;
				Utils.logger.log(message, args);
				this.dispatchEvent(new CustomEvent("iostatus", { bubbles: true, composed: true, detail: { message, status: "LOST", color: "red" } }));
			});
		});

		this.socket.io.on("error", (error) => {
			message = `Socket.io | Unable to connect | ${error}`;
			Utils.logger.log(message, error);
			this.dispatchEvent(new CustomEvent("iostatus", { bubbles: true, composed: true, detail: { message, status: "ERROR", color: "red" } }));
		});

		this.socket.io.on("reconnect", (...args) => {
			message = `Socket.io | Connection restablished`;
			Utils.logger.log(message, args);
			this.dispatchEvent(
				new CustomEvent("iostatus", { bubbles: true, composed: true, detail: { message, status: "RESTABLISHED", color: "green" } })
			);
		});
	}

	listen() {
		this.socket.on("PONG", (payload) => {
			this.dispatchEvent(new CustomEvent("received", { detail: payload }));
		});
	}
}
