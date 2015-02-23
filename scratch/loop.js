var fs = require("fs");
var Firebase = require("firebase");
var config, fb, urls, counter;

function init() {
  config = {};
  urls = [];
  counter = 0;
  fs.readFile("./config.json", {"encoding": "utf8"}, function(err, data) {
    if (err) {
      console.log("Error reading config.", err);
    } else {
      config = JSON.parse(data);
      fb = new Firebase(config.fbURL);
      console.log("URL Loop Sender");
      fb.authWithCustomToken(config.fbKey, function(error, authToken) {
        if (error) {
          console.log("Firebase connection failed.", error);
        } else {
          console.log("Firebase connection successful...");
          fb.child("urlsToLoop").on("value", function(snapshot) {
            urls = snapshot.val();
            console.log("URLs loaded:", urls.length);
          });
          loop();
        }
      });
    }
  });
  
}

function loop() {
  if (urls.length > 0) {
    var i = counter++ % urls.length;
    console.log("Send", i, urls[i]);
    var data = {
      "url": urls[i],
      "date": Date.now(),
      "runTests": true
    }
    fb.child("url").push(data);
  }
  setTimeout(loop, 15000);
}

init();