import { api, LightningElement, track } from "lwc";

export default class Iostatus extends LightningElement {
	_eventData;
	@track iostatus = {
		isVisible: true,
		message: "Socket.io | No connection information",
		color: "black",
		get class() {
			return `box ${this.color}`;
		}
	};

	@api
	get eventData() {
		return this._eventData;
	}
	set eventData(value) {
		if (value) {
			this._eventData = value;
			this.iostatus.isVisible = true;
			Object.assign(this.iostatus, value);
		}
	}
}
