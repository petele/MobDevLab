var Firebase = require("firebase");



function init() {
  var fb = new Firebase("https://shining-inferno-4243.firebaseio.com/");
  fb.child("url").limitToLast(1).on("child_added", function(snapshot) {
    //console.log("Watching", snapshot.val());
    snapshot.ref().on("value", function(snap) {
      //console.log(" -- ", snap.val());
      var val = snap.val();
      if (val.score) {
        console.log(val.url, val.score);
      }
    });
  });
}









init();
