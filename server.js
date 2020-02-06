let WSServer = require('ws').Server;
let server = require('http').createServer();
let app = require('./http-server');
const fs = require('fs')
const path = require('path')

// Create web socket server on top of a regular http server
let wss = new WSServer({

  server: server
});

setInterval(function() {
    walkDir('./rooms/', function(filePath) {
    fs.stat(filePath, function(err, stat) {
    var now = new Date().getTime();
    var endTime = new Date(stat.mtime).getTime() + 300000; // 1days in miliseconds

    if (err) { return console.error(err); }

    if (now > endTime) {
      console.log('DEL:', filePath);
      return fs.unlink(filePath, function(err) {
        if (err) return console.error(err);
      });
    }
  })  
});
}, 60000); // every 1 minutes


function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
};

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
    } else if (messageType == "ytvideo") {
      var vidUrl = splitMessage[1]
      var roomId = splitMessage[2]
      var username = splitMessage[3]
      const path = './rooms/' + roomId + ".txt"
      try {
        if (fs.existsSync(path)) {
          //file exists
          fs.appendFileSync(path, "\n" + "ytvideo|" + vidUrl + "|" + username)
        } else {
          //file doesn't exist
        }
      } catch(err) {
        console.error(err)
      }
      messageToSendToClients = "receivedYTVideo|" + vidUrl + "|" + roomId + "|" + username
    }
    connections.forEach(function(socket, index){
      socket.send(messageToSendToClients)
    })
  });
});




server.listen(process.env.PORT, function() {

  console.log(`http/ws server listening on ${process.env.PORT}`);
});