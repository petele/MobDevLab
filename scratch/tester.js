var Firebase = require("firebase");
var psi = require('psi');
var WebPageTest = require('webpagetest');
var wpt = new WebPageTest('www.webpagetest.org');

function init() {
  var fbKey = "0xkHHBbc84bcxkAVwcfQ00HjTjdwFc0str228AuW";
  var fb = new Firebase("https://shining-inferno-4243.firebaseio.com/");
  fb.authWithCustomToken(fbKey, function(error, authToken) {
    if (error) {
      console.log("Firebase connection failed.", error);
    } else {
      console.log("Firebase connection successful...");
      
    }
  });
  fb.child("url").limitToLast(1).on("child_added", function(snapshot) {
    var val = snapshot.val();
    psi(val.url, {"strategy": "mobile"}, function (err, data) {
      snapshot.ref().child("score/mobile/psi").set(data.score);
      snapshot.ref().child("score/mobile/pageStats").set(data.pageStats);
    });
    psi(val.url, {"strategy": "desktop"}, function (err, data) {
      snapshot.ref().child("score/desktop/psi").set(data.score);
      snapshot.ref().child("score/desktop/pageStats").set(data.pageStats);
    });
    wpt.runTest(val.url, {"key": "A.1e67e897023b8858a078e3c441366a03"}, function(err, data) {
      console.log(data);
    });
    
  });
}


init();
