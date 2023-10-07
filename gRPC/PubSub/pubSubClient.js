import PubSubApiClient from "salesforce-pubsub-api-client";

async function run() {
	let client;
	let events;
	let lastReplayId;

	const initializeClient = async () => {
		client = new PubSubApiClient();
		await client.connect();
	};

	const subscribe = async (channel) => {
		return new Promise(async (resolve, reject) => {
			// let promise = client.subscribe(channel, 1);
			let promise = client.subscribeFromReplayId(channel, 2, lastReplayId);
			// This wait seems to solve a synchronization problem
			await new Promise((resolve2) => setTimeout(resolve2, 1e2));
			promise
				.then((listener) => {
					listener.on("data", (event) => {
						lastReplayId = Math.max(lastReplayId, event.replayId);
						events[event.replayId] = event;
					});
					listener.on("lastevent", (event) => {
						console.log(`Received ${Object.keys(events).length} event`);
						console.log(`Reached last requested event on channel ${listener.getTopicName()}.`);
						resolve();
					});
				})
				.catch((error) => {
					console.error(error);
					console.log("ABORTED");
					reject(error);
				});
		});
	};

	try {
		events = {};
		lastReplayId = 0;
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
