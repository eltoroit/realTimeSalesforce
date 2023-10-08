const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDefinition = protoLoader.loadSync("@ELTOROIT/protos/helloworld.proto", {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
// helloworld (package in .proto)
const nsProto = protoDescriptor.helloworld;

// sayHello (rpc function defined in .proto. But implemened here)
function sayHello(call, callback) {
	// name (variable defined in the message in .proto)
	console.log(`${new Date().toJSON()} Server received request for [sayHello]`);
	callback(null, {
		message: `${new Date().toJSON()} - Hello <${call.request.name}>`
	});
}

function sayHelloAgain(call, callback) {
	console.log(`${new Date().toJSON()} Server received request for [sayHelloAgain]`);
	callback(null, {
		message: `${new Date().toJSON()} - Hello again, <${call.request.name}>`
	});
}

// Starts an RPC server that receives requests for the Greeter service at the sample server port
function main() {
	const server = new grpc.Server();
	// Greeter (service in .proto)
	server.addService(nsProto.Greeter.service, { sayHello, sayHelloAgain });
	server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () => {
		server.start();
	});
}

main();
