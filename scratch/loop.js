var Firebase = require("firebase");

var fb = new Firebase("https://shining-inferno-4243.firebaseio.com/");

var urls = [
  'https://www.unb.ca',
  'http://www.petelepage.com',
  'https://gauntface.com/blog',
  'http://paul.kinlan.me/',
  'http://www.samdutton.com/',
  'http://petelepage.com/blog/2014/07/devlab/',
  'https://events.google.com/io2015/',
  'http://play.google.com',
  'https://www.igvita.com/',
  'http://jakearchibald.com/',
  'http://cwilso.com/'
];
var counter = 0;

function loop() {
  var i = counter++ % urls.length;
  console.log("Send", i, urls[i]);
  fb.child("url").set(urls[i]);
  setTimeout(loop, 15000);
}

loop();