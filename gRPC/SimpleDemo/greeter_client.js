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

function main() {
	const target = "localhost:50051";
	// Greeter (service in .proto)
	const client = new nsProto.Greeter(target, grpc.credentials.createInsecure());
	client.sayHello({ name: "world" }, function (err, response) {
		console.log(response.message);
	});
	client.sayHelloAgain({ name: "world" }, function (err, response) {
		console.log(response.message);
	});
}

main();
