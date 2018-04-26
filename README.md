# playcanvas-nodejs
A "headless" implementation of the PlayCanvas Game Engine for use in nodejs applications

# dependencies
- NodeJS.
- "websocket" lib. (https://www.npmjs.com/package/websocket)
- "playcanvas" lib. (already included in node_modules, pretty dirty implementation)
- "jsdom" lib. (https://www.npmjs.com/package/jsdom)
- "canvas-mock" lib. (https://www.npmjs.com/package/canvas-mock)

The implementation is pretty dirty, I simply create a fake window/jsdom which is what PlayCanvas requires to run. This achieves the game engine running alongside nodejs in a "graphics-less" environment.

# how to run
1. Ensure you have NODEJS installed on your computer.
2. Download this repository and open a Command Prompt on the directory (on windows), write "node gameserver.js" and press enter.
3. Play the PlayCanvas Client I made as an example for this: http://launch.playcanvas.com/606346?debug=true

You should see a ball bouncing against a ground.

All the physics run on the server side, the client is just displaying the information.

You can see the client project here: https://playcanvas.com/editor/scene/606346
