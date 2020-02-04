let WSServer = require('ws').Server;
let server = require('http').createServer();
let app = require('./http-server');
const fs = require('fs')

// Create web socket server on top of a regular http server
let wss = new WSServer({

  server: server
});

server.on('request', app);
var connections = []
wss.on('connection', function connection(ws) {
  connections.push(ws)
  console.log("Connected!")
  ws.on('message', function incoming(message) {
    var splitMessage = message.split("|")
    var messageType = splitMessage[0]
    var messageToSendToClients = ""
    if(messageType == "message") {
      var messageContent = splitMessage[1]
      var roomId = splitMessage[2]
      console.log(roomId)
      const path = './rooms/' + roomId + ".txt"
      try {
        if (fs.existsSync(path)) {
          //file exists
          fs.appendFileSync(path, "\n" + messageContent)
        } else {
          //file doesn't exist
        }
      } catch(err) {
        console.error(err)
      }
      console.log(messageContent)
      messageToSendToClients = "received|" + messageContent + "|" + roomId
    } else if (messageType == "image") {
      var image = splitMessage[1]
      var roomId = splitMessage[2]
      var username = splitMessage[3]
      const path = './rooms/' + roomId + ".txt"
      try {
        if (fs.existsSync(path)) {
          //file exists
          fs.appendFileSync(path, "\n" + "image|" + image + "|" + username)
        } else {
          //file doesn't exist
        }
      } catch(err) {
        console.error(err)
      }
      messageToSendToClients = "receivedImage|" + image + "|" + roomId + "|" + username
    }
    connections.forEach(function(socket, index){
      socket.send(messageToSendToClients)
    })
  });
});




server.listen(process.env.PORT, function() {

  console.log(`http/ws server listening on ${process.env.PORT}`);
});