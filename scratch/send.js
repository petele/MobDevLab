var Firebase = require("firebase");

var fb = new Firebase("https://shining-inferno-4243.firebaseio.com/");

var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Quick URL Sender");
console.log(" use 'quit' to quit.");

function ask() {
  rl.question("URL to send: ", function(answer) {
    if (answer.trim() === 'quit') {
      console.log("Quitting...");
      rl.close();
      console.log(fb);
      fb.goOffline();
    } else {
      console.log("[SENT]", answer);
      fb.child("url").set(answer);
      ask();
    }
  });
}

ask();
