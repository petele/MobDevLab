var Firebase = require("firebase");
var fb;
var urls = [];
var counter = 0;
var fbKey = "0xkHHBbc84bcxkAVwcfQ00HjTjdwFc0str228AuW";

function init() {
  fb = new Firebase("https://shining-inferno-4243.firebaseio.com/");
  console.log("URL Loop Sender");
  fb.authWithCustomToken(fbKey, function(error, authToken) {
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

function loop() {
  if (urls.length > 0) {
    var i = counter++ % urls.length;
    console.log("Send", i, urls[i]);
    var data = {
      "url": urls[i],
      "date": Date.now()
    }
    fb.child("url").push(data);
  }
  setTimeout(loop, 15000);
}

init();