var Firebase = require("firebase");
var readline = require("readline");
var fb, rl;

var fbKey = "0xkHHBbc84bcxkAVwcfQ00HjTjdwFc0str228AuW";

function init() {
  console.log("Quick URL Sender");
  console.log(" use 'quit' to quit.");
  fb = new Firebase("https://shining-inferno-4243.firebaseio.com/");
  fb.authWithCustomToken(fbKey, function(error, authToken) {
    if (error) {
      console.log("Firebase connection failed.", error);
    } else {
      console.log("Firebase connection successful...");
      rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      ask();
    }
  });
}

function ask() {
  rl.question("URL to send: ", function(answer) {
    if (answer.trim() === 'quit') {
      console.log("Quitting...");
      rl.close();
      process.exit();
    } else {
      var data = {
        "url": answer,
        "date": Date.now()
      };
      console.log("[SENT]", data);
      fb.child("url").push(data);
      ask();
    }
  });
}

init();
