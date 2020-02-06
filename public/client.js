function readURL(input) {
  if (input.files && input.files[0]) {
    if (input.files[0].type.includes("image")) {
      var reader = new FileReader();
      reader.onload = function(e) {
        $("#uploadImageDisplay")
          .attr("src", e.target.result)
          .width(150)
          .height(200);
        var base64Img = e.target.result;
        document.getElementById("messageBox").value = "Uploaded Image";
        $("#sendButton").trigger("click");
        //document.getElementById("messageBox").value = "";
      };
      reader.readAsDataURL(input.files[0]);
      console.log(input.files[0].type);
    } else {
      alert("Please upload an image!");
    }
  }
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function findUrlFromString(url) {
  var matches = url.match(/\bhttps?:\/\/\S+/gi);
  return matches
}


$("#uploadButton").click(function(e) {
  e.preventDefault();
  $("#imageInput").trigger("click");
});
function getRoomId() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(
    m,
    key,
    value
  ) {
    vars[key] = value;
  });
  return vars.roomId;
}

function getUsername() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(
    m,
    key,
    value
  ) {
    vars[key] = value;
  });
  return vars.username;
}
var roomId = getRoomId();
var username = getUsername();
document.getElementById("roomCode").innerText = "Room ID: " + roomId;
document.getElementById("qrCode").src =
  "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://prontochat.glitch.me/join?roomId=" +
  roomId;
if (username == null) {
  window.location.replace("http://prontochat.glitch.me/join?roomId=" + roomId);
}
console.log(roomId);
var qrCodeVisible = false;
document.getElementById("inviteButton").onclick = function() {
  if (qrCodeVisible == false) {
    document.getElementById("qrCode").style =
      "position: fixed; top: 10%; right: 2%; z-index:100; display:block;";
    document.getElementById("inviteButton").innerText = "Hide Code";
    qrCodeVisible = true;
  } else {
    document.getElementById("qrCode").style =
      "position: fixed; top: 10%; right: 2%; z-index:100; display:none;";
    document.getElementById("inviteButton").innerText = "Invite Friends";
    qrCodeVisible = false;
  }
};
function createSocket() {
  var exampleSocket = new WebSocket("wss://prontochat.glitch.me");
  exampleSocket.onclose = function(event) {
    console.log("Closed!");
    createSocket();
  };
  exampleSocket.onopen = function(event) {
    console.log("Opened!");
    function sendMessage(message) {
      exampleSocket.send("message|" + message + "|" + roomId);
    }
    function sendImage(image) {
      exampleSocket.send("image|" + image + "|" + roomId + "|" + username);
    }
    function sendYTVideo(url) {
      exampleSocket.send("ytvideo|" + url + "|" + roomId + "|" + username);
    }
    function displayMessage(message) {
      var cloneMessage = document
        .getElementById("receivedMessage1")
        .cloneNode(true);
      cloneMessage.innerHTML = message;
      var messages = document.getElementById("messages");
      var numberOfMessages = messages.childElementCount;
      cloneMessage.id = "receivedMessage" + numberOfMessages + 1;
      messages.appendChild(cloneMessage);
      messages.scrollTop = messages.scrollHeight;
    }
    function displayImage(userWhoSent, imageSent) {
      var cloneMessage = document
        .getElementById("receivedMessage1")
        .cloneNode(true);
      cloneMessage.innerHTML = userWhoSent + ": ";
      var messages = document.getElementById("messages");
      var numberOfMessages = messages.childElementCount;
      cloneMessage.id = "receivedMessage" + numberOfMessages + 1;
      var cloneImage = document
        .getElementById("receivedMessage1Image")
        .cloneNode(true);
      cloneImage.src = imageSent;
      cloneImage.onclick = function() {
        cloneImage.requestFullscreen();
      };
      cloneMessage.appendChild(cloneImage);
      messages.appendChild(cloneMessage);
      messages.scrollTop = messages.scrollHeight;
    }
    function displayIframe(userWhoSent, urlSent) {
      if(urlSent.includes("/embed/")) {

      } else {
        urlSent = "https://www.youtube.com/embed/" + urlSent.split("v=")[1]
      }
      var cloneMessage = document
        .getElementById("receivedMessage1")
        .cloneNode(true);
      cloneMessage.innerHTML = userWhoSent + ": ";
      var messages = document.getElementById("messages");
      var numberOfMessages = messages.childElementCount;
      cloneMessage.id = "receivedMessage" + numberOfMessages + 1;
      var cloneIframe = document
        .getElementById("receivedMessage1Iframe")
        .cloneNode(true);
        cloneIframe.src = urlSent;
      cloneMessage.appendChild(cloneIframe);
      messages.appendChild(cloneMessage);
      messages.scrollTop = messages.scrollHeight;
    }
    function parseRawMessage(messageBoxText){
      if (messageBoxText != "") {
        document.getElementById("messageBox").value = "";
        if (findUrlFromString(messageBoxText) !== null) {
          var linkedText = messageBoxText
          findUrlFromString(messageBoxText).forEach(element => {
              if(element.includes("youtube.com")) {
                console.log("Found url " + element)
                sendMessage(username + ": " + messageBoxText.replace(element, "<a href=" + element + ">" + element + "</a>"));
                sendYTVideo(element)
              } else if (element.includes("png") ||element.includes("jpg") ||element.includes("jpeg") ||element.includes("gif")) {
                console.log("Include sit!");
                var img = element;
                sendMessage(username + ": " + messageBoxText.split(img)[0]);
                sendImage(img);
                document.getElementById("messageBox").value = "";
              } else {
                linkedText = replaceAll(linkedText, element, "<a href=" + element + ">" + element + "</a>")
                console.log("replaced")
              }
          });
          if(linkedText !== messageBoxText) {
            sendMessage(linkedText)
          }
        } else if (messageBoxText.includes("md:") || messageBoxText.includes("markdown:")) {
          var markDown = messageBoxText.substring(messageBoxText.indexOf(':') + 1);
          var converter = new showdown.Converter(),
            mdHtml      = converter.makeHtml(markDown);
          sendMessage(username + ": " + mdHtml)
        } else {
          sendMessage(username + ": " + messageBoxText);
        }
      }
    }
    document.getElementById("messageForm").addEventListener(
      "submit",
      function(e) {
        var messageBoxText = document.getElementById("messageBox").value;
        parseRawMessage(messageBoxText)
        e.preventDefault();
      },
      false
    );
    document.getElementById("sendButton").onclick = function(e) {
      var messageBoxText = document.getElementById("messageBox").value;
      if (messageBoxText == "Uploaded Image") {
        var imgSource = document.getElementById("uploadImageDisplay").src;
        console.log(imgSource);
        sendImage(imgSource);
      } else {
        parseRawMessage(messageBoxText)
      }
      e.preventDefault();
    };
    for (i = 0; i < 50; i++) {
      displayMessage(" ");
    }
    $.get(
      "http://prontochat.glitch.me/getRoomMessages?roomId=" + roomId,
      function(data) {
        var previousMessages = data.split("\n");
        previousMessages.forEach(message => {
          var splitMessage = message.split("|");
          if (splitMessage[1]) {
            if (splitMessage[0] == "image") {
              displayImage(splitMessage[2], splitMessage[1]);
            }else if (splitMessage[0] == "ytvideo") {
              displayIframe(splitMessage[2], splitMessage[1])
          }
            }  else {
              displayMessage(message);
            }
        });
      }
    );
    exampleSocket.onmessage = function(event) {
      var messageData = event.data;
      var splitMessageData = messageData.split("|");
      if (splitMessageData[0] == "received") {
        var destinationRoom = splitMessageData[2];
        if (destinationRoom == roomId) {
          console.log(destinationRoom);
          var messageContent = splitMessageData[1];
          var userWhoSent = splitMessageData[3];
          console.log(messageContent);
          displayMessage(messageContent);
        }
      } else if (splitMessageData[0] == "receivedImage") {
        var destinationRoom = splitMessageData[2];
        if (destinationRoom == roomId) {
          var imageToDisplay = splitMessageData[1];
          var userWhoSent = splitMessageData[3];
          displayImage(userWhoSent, imageToDisplay);
        }
      } else if (splitMessageData[0] == "receivedYTVideo") {
        var destinationRoom = splitMessageData[2];
        if (destinationRoom == roomId) {
          var videoToDisplay = splitMessageData[1];
          var userWhoSent = splitMessageData[3];
          displayIframe(userWhoSent, videoToDisplay);
        }
      }
    };
    function retrieveImageFromClipboardAsBase64(
      pasteEvent,
      callback,
      imageFormat
    ) {
      if (pasteEvent.clipboardData == false) {
        if (typeof callback == "function") {
          callback(undefined);
        }
      }

      var items = pasteEvent.clipboardData.items;

      if (items == undefined) {
        if (typeof callback == "function") {
          callback(undefined);
        }
      }

      for (var i = 0; i < items.length; i++) {
        // Skip content if not image
        if (items[i].type.indexOf("image") == -1) continue;
        // Retrieve image on clipboard as blob
        var blob = items[i].getAsFile();

        // Create an abstract canvas and get context
        var mycanvas = document.createElement("canvas");
        var ctx = mycanvas.getContext("2d");

        // Create an image
        var img = new Image();

        // Once the image loads, render the img on the canvas
        img.onload = function() {
          // Update dimensions of the canvas with the dimensions of the image
          mycanvas.width = this.width;
          mycanvas.height = this.height;

          // Draw the image
          ctx.drawImage(img, 0, 0);

          // Execute callback with the base64 URI of the image
          if (typeof callback == "function") {
            callback(mycanvas.toDataURL(imageFormat || "image/png"));
          }
        };

        // Crossbrowser support for URL
        var URLObj = window.URL || window.webkitURL;

        // Creates a DOMString containing a URL representing the object given in the parameter
        // namely the original Blob
        img.src = URLObj.createObjectURL(blob);
      }
    }
    window.addEventListener(
      "paste",
      function(e) {
        // Handle the event
        retrieveImageFromClipboardAsBase64(e, function(imageDataBase64) {
          // If there's an image, open it in the browser as a new window :)
          if (imageDataBase64) {
            // data:image/png;base64,iVBORw0KGgoAAAAN......
            //window.open(imageDataBase64);
            sendImage(imageDataBase64);
          }
        });
      },
      false
    );
  };
}

createSocket();
