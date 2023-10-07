import PubSubApiClient from "salesforce-pubsub-api-client";

async function run() {
	let client;
	// let events = {};
	// let lastReplayId = 0;

	const initializeClient = async () => {
		client = new PubSubApiClient();
		await client.connect();
	};

	const subscribe = async (channel) => {
		console.log(`${new Date().toJSON()} Subscribing`);
		let subscriberPromise = new Promise((resolve2, reject2) => {
			// let promise = client.subscribeFromReplayId(channel, 2, lastReplayId);
			let listenerPromise = client.subscribe(channel, 1);
			listenerPromise
				.then((listener) => {
					listener.on("data", (event) => {
						// lastReplayId = Math.max(lastReplayId, event.replayId);
						// events[event.replayId] = event;
					});
					listener.on("lastevent", (event) => {
						// console.log(`Received ${Object.keys(events).length} event`);
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
	};

	try {
		let channel = "/event/CloudNews__e";
		// let channel = "/data/AccountChangeEvent";

		await initializeClient();
		while (true) {
			await subscribe(channel);
		}
	} catch (error) {
		console.error(error);
		console.log("ABORTED");
	}
}

run();
