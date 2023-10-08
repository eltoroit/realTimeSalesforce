import Util from "c/utils";
import ET_Asserts from "c/etAsserts";
import { LightningElement } from "lwc";

export default class WebSockets extends LightningElement {
	text = "";
	output = "";
	color = "#00FF00";
	iostatusEventData = null;

	get style() {
		return `background-color: ${this.color}; width: 100%; height: 50px`;
	}

	onTextChange(event) {
		this.text = event.target.value;
		this.onPublishClick();
	}

	onColorChange(event) {
		this.color = event.target.value;
		this.onPublishClick();
	}

	onPublishClick() {
		this.publish({ eventName: "PING", payload: { text: this.text, color: this.color, ping: new Date() } });
	}

	//#region SOCKET_IO
	publish({ eventName, payload }) {
		ET_Asserts.hasData({ value: payload, message: "payload" });
		ET_Asserts.hasData({ value: eventName, message: "eventName" });

		this.refs.SocketIO.publish({ eventName, payload });
	}

	onEventReceived(event) {
		this.output = JSON.stringify(event.detail, null, 2);
		this.text = event.detail.text;
		this.color = event.detail.color;
	}

	onIOStatus(event) {
		Util.logger.log("@@@-WebSocket.onIOStatus", { ...event.detail });
		this.iostatusEventData = event.detail;
	}
	//#endregion
}
