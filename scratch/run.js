var fs = require("fs");
var Firebase = require("firebase");
var adb = require("adbkit");

var config, devices, adbClient;

function addDevice(device) {
  if ((device.type === "device") && (devices.indexOf(device.id) === -1)) {
    devices.push(device.id);
    console.log("+", device.id);
  }
}

function removeDevice(device) {
  var idx = devices.indexOf(device.id);
  if (idx >= 0) {
    devices.splice(idx, 1);
    console.log("-", device.id);
  }
}

function deviceChange(device) {
  if (device.type === "device") {
    addDevice(device);
  } else if (device.type === "offline") {
    removeDevice(device);
  }
}

function sendIntentToDevices(intent) {
  console.log("sendIntent", intent.data, devices);
  for (var i = 0; i < devices.length; i++) {
    adbClient.startActivity(devices[i], intent);
  }
}

function openWithChrome(url) {
  var intent = {
    "wait": false,
    "action": "android.intent.action.VIEW",
    "component": "com.android.chrome/com.google.android.apps.chrome.Main",
    "flags": [0x10000000],
    "extras": [
      {"key": "com.android.browser.application_id", "type": "string", "value": "com.android.chrome"}
    ],
    "data": url
  };
  sendIntentToDevices(intent);
}

function initDeviceWatcher() {
  adbClient.trackDevices(function(err, t) {
  if (err) {
    console.log("TrackClient Error", err);
    process.exit();
  } else {
    t.addListener("add", addDevice);
    t.addListener("remove", removeDevice);
    t.addListener("change", deviceChange);
  }
});
}

function init() {
  console.log("Device Lab Runner");
  config = {};
  devices = [];
  adbClient = adb.createClient();

  fs.readFile("./config.json", {"encoding": "utf8"}, function(err, data) {
    if (err) {
      console.log("Error reading config", err);
      process.exit();
    } else {
      console.log("* Config file read.");
      config = JSON.parse(data);
      var fb = new Firebase(config.fbURL);
      fb.authAnonymously(function(err, authData) {
        if (err) {
          console.log("Error connecting to Firebase.");
          process.exit();
        } else {
          console.log("* Connected to Firebase.");
          initDeviceWatcher();
          fb.child("url").limitToLast(1).on("child_added", function(snapshot) {
            var val = snapshot.val();
            if (val.url) {
              openWithChrome(val.url);
            }
          });
        }
      });
    }
  });
}

init();
