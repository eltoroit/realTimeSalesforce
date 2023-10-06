import PubSubApiClient from "salesforce-pubsub-api-client";

async function run() {
	let client;

	const initializeClient = async () => {
		client = new PubSubApiClient();
		await client.connect();
	};

	const subscribe = async (channel) => {
		return new Promise(async (resolve, reject) => {
			let promise = client.subscribe(channel, 1);
			// This wait seems to solve a syncronization problem
			await new Promise((resolve2) => setTimeout(resolve2, 1e1));
			promise
				.then((listener) => {
					listener.on("data", (event) => {
						console.log("Received event");
					});
					listener.on("lastevent", (event) => {
						// At this point the gRPC client will close automatically
						// unless you re-subscribe to request more events (default Pub/Sub API behavior)
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
		let channel;
		// channel = "/data/AccountChangeEvent";
		channel = "/event/CloudNews__e";

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
