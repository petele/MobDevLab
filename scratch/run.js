var Firebase = require("firebase");
var adb = require("adbkit");
var adbClient = adb.createClient();
var devices = [];

var startActivityOptions = {
  "wait": false,
  "action": "android.intent.action.VIEW",
  "component": "com.android.chrome/com.google.android.apps.chrome.Main",
  "flags": [0x10000000],
  "extras": [
    {"key": "com.android.browser.application_id", "type": "string", "value": "com.android.chrome"}
  ]
};

function init() {
  var fb = new Firebase("https://shining-inferno-4243.firebaseio.com/");
  fb.child("url").limitToLast(1).on("child_added", function(snapshot) {
    var val = snapshot.val();
    openURLOnDevices(val.url);
  });
}

function addDevice(device) {
  devices.push(device.id);
  console.log("Add Device", device.id, devices.length);
}

function removeDevice(device) {
  var idx = devices.indexOf(device.id);
  if (idx >= 0) {
    devices.splice(idx, 1);
  }
  console.log("Remove Device", device.id, devices.length);
}

function openURLOnDevices(url) {
  startActivityOptions.data = url;
  for (var i = 0; i < devices.length; i++) {
    console.log("OpenURL", url, devices[i]);
    adbClient.startActivity(devices[i], startActivityOptions);
  }
}

adbClient.trackDevices(function(err, t) {
  if (err) {
    console.log("Error", err);
  } else {
    t.addListener("add", addDevice);
    t.addListener("remove", removeDevice);
  }
});


init();
