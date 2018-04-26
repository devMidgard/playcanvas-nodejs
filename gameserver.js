// define the GameServer namespace
GameServer = this;
GameServer.prototype = this;
// include libs
var util = require("util");
var fs = require("fs");
var jsdom = require("jsdom").jsdom;
var window = jsdom().defaultView;
var canvasMockify = require("canvas-mock");
var pc = require("playcanvas");
var WebSocketServer = require("websocket").server;
var http = require("http");

// create a fake window environment to be able to run PlayCanvas
var canvas = window.document.createElement("canvas");
canvasMockify(canvas);

var app = null;
var httpServer;
var wsServer;
var ball = null;

// Helper function to load game scripts
function LoadScript(script) {
    try {
        eval(fs.readFileSync(__dirname + '/scripts/' + script) + '');
        console.log("loaded script '" + script + "'");
    } catch (err) {
        console.log("script '" + script + "' couldn't be loaded: " + err);
    }
}

// load the console commands component
LoadScript("console.js");

GameServer.prototype.InitializeEngine = function () {
    // Init the PlayCanvas Engine
    app = new pc.Application(canvas, {});
    app.start();

    // Set the scene gravity
    app.systems.rigidbody.setGravity(0, -9.8, 0);

    // set engine update cycle call (in case you want to do something with it)
    app.on("update", this.Update);

    // Load Game Scripts
    LoadScript("testcomponent.js");

    // Create a a ground entity
    var ground = new pc.Entity();
    // give it collision and rigidbody, so it can actually stop objects from going through
    ground.addComponent("collision", {
        type: 'box',
        halfExtents: new pc.Vec3(10, 0, 10)
    });
    ground.addComponent("rigidbody", {
        type: "static",
        // make it bouncy!
        restitution: 1
    });
    // add the entity to the app root
    // - at this point the ground is at World 0,0,0 as we haven't set it a position -
    app.root.addChild(ground);

    // Create a ball to make it bounce against the ground so we can sync some movement through the network
    ball = new pc.Entity();
    ball.addComponent("collision", {
        type: 'sphere',
        radius: 0.5
    });
    ball.addComponent("rigidbody", {
        type: "dynamic",
        // make it bouncy!
        restitution: 1
    });
    // add the test component to the ball
    ball.addComponent("script");
    ball.script.create("testComponent");
    // move the ball a little bit up so it can fall by the force of gravity and bounce upwards when colliding
    // against the ground we created
    ball.rigidbody.teleport(0, 2, 0);
    // add the ball entity to the app root, either way it will not get processed by the physics engine
    app.root.addChild(ball);

    // Once PlayCanvas has been initialized and the scene is ready, listen for websocket connections
    GameServer.Listen();
};

GameServer.prototype.Update = function (deltaTime) {
    console.log(ball.getPosition());

    // Send the ball state to all connected clients every Update frame
    GameServer.Broadcast({ header: "ballState", pos: ball.getPosition() });
};

function OriginIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed or not.
    return true;
}

GameServer.connections = [];

GameServer.prototype.Listen = function () {
    httpServer = http.createServer(function (request, response) {
        console.log("Received request from " + request.url);
        response.writeHead(404);
        response.end();
    });
    httpServer.listen(9090, function () {
        console.log("GameServer listening on port 9090");
    });
    wsServer = new WebSocketServer({
        httpServer: httpServer,
        autoAcceptConnections: false
    });

    wsServer.on("request", function (request) {
        if (!OriginIsAllowed(request.origin)) {
            request.reject();
            console.log("Rejected request coming from " + request.origin);
            return;
        }

        var connection = request.accept('', request.origin);
        GameServer.connections.push(connection);
        console.log('Connection accepted.');

        // Handle network client messages
        connection.on("message", function (message) {
            if (message.type === "utf8") {
                console.log('Received utf8 packet: ' + message.utf8Data);
            }
            else {
                // if you want to handle binary or other kinds of packet types, feel free to implement here
            }
        });

        connection.on("close", function () {
            var i = GameServer.connections.indexOf(connection);
            GameServer.connections.splice(i, 1);

            console.log("A connection was closed and removed from the connections list.");
        });
    });
};

// Send a packet to a specific client
GameServer.prototype.Send = function (connection, packet) {
    connection.sendUTF(JSON.stringify(packet));
};

// Send a packet to every client currently connected and validated to the server
GameServer.prototype.Broadcast = function (packet) {
    GameServer.connections.forEach(function (connection) {
        GameServer.Send(connection, packet);
    });
};

// Start the engine, let it set up, and then it will automatically listen for clients if all goes well
GameServer.InitializeEngine();