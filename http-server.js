let fs = require('fs');
let express = require('express');
let app = express();
const WebSocket = require('ws');
// Let's create the regular HTTP request and response
app.use(express.static('public'))

app.get('/', function(req, res) {
  res.redirect("https://prontochat.glitch.me/join")
});
app.get('/join', function(req, res) {
  res.sendFile(__dirname + '/startScreen.html');
})

app.get('/getRoomMessages', function(req, res) {
  var roomId = req.query.roomId
  const path = './rooms/' + roomId + ".txt"
  try {
    if (fs.existsSync(path)) {
      //file exists
      var previousMessages = fs.readFileSync(path, 'utf8')
      res.json(previousMessages)
    } else {
       //file doesn't exist
      fs.writeFile(path, "Room Opened", (err) => {
        if (err) throw err;
        var previousMessages = fs.readFileSync(path, 'utf8')
        res.json(previousMessages)
      }); 
     }
  } catch(err) {
     console.error(err)
   }
});

app.get('/room', function(req, res) {
  console.log('Get index');
  var roomId = req.query.roomId
  console.log(roomId)
  res.sendFile(__dirname + '/public/index.html')
}); 




module.exports = app;