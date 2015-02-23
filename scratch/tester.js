var fs = require("fs");
var Firebase = require("firebase");
var psi = require('psi');
var WebPageTest = require('webpagetest');
var wpt = new WebPageTest('www.webpagetest.org');

var config;

function init() {
  fs.readFile("./config.json", {"encoding": "utf8"}, function(err, data) {
    if (err) {
      console.log("Error reading config.");
    } else {
      config = JSON.parse(data);
      var fb = new Firebase(config.fbURL);
      fb.authWithCustomToken(config.fbKey, function(error, authToken) {
        if (error) {
          console.log("Firebase connection failed.", error);
        } else {
          console.log("Firebase connection successful...");
          fb.child("url").limitToLast(1).on("child_added", function(snapshot) {
            var val = snapshot.val();
            if ((val.url) && (val.runTests === true)) {
              console.log("Running tests for:", val.url);
              psi(val.url, {"strategy": "mobile"}, function (err, data) {
                var result = {
                  "score": data.score,
                  "pageStats": data.pageStats
                };
                snapshot.ref().child("score/mobile/psi").set(result);
              });
              psi(val.url, {"strategy": "desktop"}, function (err, data) {
                var result = {
                  "score": data.score,
                  "pageStats": data.pageStats
                };
                snapshot.ref().child("score/desktop/psi").set(result);
              });
              wpt.runTest(val.url, {"key": config.wptKey, "mobile": true}, function(err, data) {
                if (data.data) {
                  var result = {
                    "testId": data.data.testId,
                    "jsonUrl": data.data.jsonUrl
                  };
                  snapshot.ref().child("score/mobile/wpt").set(result);
                }
              });
              wpt.runTest(val.url, {"key": config.wptKey}, function(err, data) {
                if (data.data) {
                  var result = {
                    "testId": data.data.testId,
                    "jsonUrl": data.data.jsonUrl
                  };
                  snapshot.ref().child("score/desktop/wpt").set(result);
                }
              });
            }
          });
        }
      });
    }
  });
  
  
  
}


init();
