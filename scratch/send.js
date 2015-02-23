var fs = require("fs");
var Firebase = require("firebase");
var readline = require("readline");
var fb, rl, config;


function init() {
  console.log("Quick URL Sender");
  fs.readFile("./config.json", {"encoding": "utf8"}, function(err, data) {
    if (err) {
      console.log("Error reading config.", err);
      process.exit();
    } else {
      config = JSON.parse(data);
      
      fb = new Firebase(config.fbURL);
      fb.authWithCustomToken(config.fbKey, function(error, authToken) {
        if (error) {
          console.log("Firebase connection failed.", error);
        } else {
          console.log("* Firebase connection successful...");
          rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });
          console.log("** Use 'quit' to quit.");
          ask();
        }
      });
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
        "date": Date.now(),
        "runTests": true
      };
      console.log("[SENT]", data);
      fb.child("url").push(data);
      ask();
    }
  });
}

init();
