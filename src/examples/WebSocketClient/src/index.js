/*
 *  This example is only used during creation of the websocket client, which is only used for
 *  implementing test cases against the websocket server.  Consumers of this library should not
 *  be using the websocket client, and this it is not exported.
 */

const MyWebSocketClient = require('./MyWebSocketClient');

const myWebSocket = new MyWebSocketClient();
myWebSocket.connect('wss://echo.websocket.org');
myWebSocket.write("Hello there 1");
myWebSocket.write("Hello there 2");
myWebSocket.write("Hello there 3");
