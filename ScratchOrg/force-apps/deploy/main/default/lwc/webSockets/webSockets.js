import Util from "c/utils";
import ET_Asserts from "c/etAsserts";
import { LightningElement } from "lwc";

export default class WebSockets extends LightningElement {
	number = 0;
	output = "";

	timer = null;
	onNumberChange(event) {
		let newValue = event.target.value;
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			this.number = Number(newValue);
		}, 1e3);
	}

	onButtonClick() {
		this.number++;
		this.publish({ eventName: "PING", payload: { number: this.number, ping: new Date() } });
	}

	//#region SOCKET_IO
	publish({ eventName, payload }) {
		ET_Asserts.hasData({ value: payload, message: "payload" });
		ET_Asserts.hasData({ value: eventName, message: "eventName" });

		this.refs.SocketIO.publish({ eventName, payload });
	}
	//#endregion

	onEventReceived(event) {
		this.output = JSON.stringify(event.detail, null, 2);
		this.number = event.detail.number;
	}
}
