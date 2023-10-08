import PubSubApiClient from "salesforce-pubsub-api-client";

export default class ELTOROIT_PUBSUB_API {
	client;
	channel;
	events = {};
	lastReplayId = 0;
	withReplayId = true;

	async initializeClient() {
		this.client = new PubSubApiClient();
		await this.client.connect();
	}

	async subscriber() {
		let listenerPromise;

		console.log(new Date().toJSON(), "SUBSCRIBING");
		let subscriberPromise = new Promise((resolve2, reject2) => {
			if (this.withReplayId) {
				listenerPromise = this.client.subscribeFromReplayId(this.channel, 2, this.lastReplayId);
			} else {
				listenerPromise = this.client.subscribe(channel, 1);
			}
			listenerPromise
				.then((listener) => {
					listener.on("data", (event) => {
						console.log(new Date().toJSON(), "DATA");
						this.lastReplayId = Math.max(this.lastReplayId, event.replayId);
						this.events[event.replayId] = event;
					});
					listener.on("lastevent", (event) => {
						console.log(new Date().toJSON(), "LAST-EVENT");
						console.log(`Received ${Object.keys(this.events).length} event`);
						console.log(`Reached last requested event on channel ${listener.getTopicName()}.`);
						resolve2();
						abortHack();
					});
				})
				.catch((error) => {
					console.error(error);
					console.log("ABORTED");
					reject2(error);
				});
		});

		// This wait seems to solve a synchronization problem
		let forceTimer;
		let promises = [];
		let forceTimerResolve;
		const abortHack = () => {
			if (forceTimerResolve) {
				clearTimeout(forceTimer);
				forceTimerResolve();
				console.log(`${new Date().toJSON()} Hack aborted`);
			}
		};
		let timerPromise = new Promise((resolve2, reject2) => {
			forceTimerResolve = resolve2;
			forceTimer = setTimeout(() => {
				forceTimerResolve = null;
				console.log(`${new Date().toJSON()} Hack ended`);
				resolve2();
			}, 5e3);
		});
		promises.push(subscriberPromise);
		promises.push(timerPromise);
		await Promise.allSettled(promises);
	}

	async publisher() {
		console.log(new Date().toJSON(), "PUBLISHING");
		const payload = {
			News_Content__c: `${new Date().toJSON()} ELTORO.IT builds the best sessions!`
			// Urgent__c: true
		};
		const publishResult = await this.client.publish(this.channel, payload);
		console.log("Published event: ", JSON.stringify(publishResult));
	}

	async run() {
		this.channel = "/event/CloudNews__e";
		// this.channel = "/data/AccountChangeEvent";
		try {
			await this.initializeClient();
			setTimeout(async () => {
				this.publisher();
			}, 10e3);
			while (true) {
				await this.subscriber(this.channel);
			}
		} catch (error) {
			console.error(error);
			console.log("ABORTED");
		}
	}
}

let demo = new ELTOROIT_PUBSUB_API();
demo.run();
