// console input
var stdin = process.openStdin();
stdin.addListener("data", function(d){
	switch(d.toString().trim()){
		case "shutdown":
        // shutdown is not defined, but this is exactly the intended behaviour, due to the exception,
        // the gameserver app will stop working, hence it's a shutdown
		shutdown();
		break;
        default:
        console.log("unknown command'" + d.toString().trim() + "'");
        break;
	}
});

console.log('Console input handler initialized');