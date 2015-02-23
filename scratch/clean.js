var fs = require("fs");
var Firebase = require("firebase");

function init() {
  fs.readFile("./config.json", {"encoding": "utf8"}, function(err, data) {
    if (err) {
      console.log("Error reading config.");
    } else {
      var config = JSON.parse(data);
      var fb = new Firebase(config.fbURL);
      console.log("URL Loop Sender");
      fb.authWithCustomToken(config.fbKey, function(error, authToken) {
        if (error) {
          console.log("Firebase connection failed.", error);
          process.exit();
        } else {
          console.log("Firebase connection successful...");
          fb.child("url").remove(function() {
            process.exit();
          });
        }
      });
    }
  });
}

init();