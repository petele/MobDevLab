var fs = require("fs");
var Firebase = require("firebase");
var adb = require("adbkit");

var config, intervalId, loopUrls, loopIndex, devices, adbClient;

function addDevice(device) {
  var url = 'data:text/html,<html><head>';
  url += '<meta name="viewport" content="width=device-width, initial-scale=1">';
  url += '<style>h1 { font-size: 55vw; text-align: center; }</style>';
  url += '</head><body>';
  url += '<div><h1>:)</h1></div>';
  url += '</body></html>';
  if ((device.type === "device") && (devices.indexOf(device.id) === -1)) {
    devices.push(device.id);
    console.log("+", device.id);
    var intent = {
      "wait": false,
      "action": "android.intent.action.VIEW",
      "component": "com.android.chrome/com.google.android.apps.chrome.Main",
      "flags": [0x10000000],
      "extras": [
        {
          "key": "com.android.browser.application_id",
          "type": "string",
          "value": "com.android.chrome"
        }
      ],
      "data": url
    };
    adbClient.startActivity(device.id, intent);
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
      {
        "key": "com.android.browser.application_id",
        "type": "string",
        "value": "com.android.chrome"
      }
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

function loopTick() {
  if (loopUrls.length > 0) {
    var i = loopIndex++ % loopUrls.length;
    openWithChrome(loopUrls[i]);
  }
}


function init() {
  console.log("Device Lab Runner");
  config = {};
  devices = [];
  loopUrls = [];
  loopIndex = 0;
  adbClient = adb.createClient();
  initDeviceWatcher();
  fs.readFile("./config.json", {"encoding": "utf8"}, function(err, data) {
    if (err) {
      console.log("Error reading config", err);
      process.exit();
    } else {
      console.log("* Config file read.");
      var connectionConfig = JSON.parse(data);
      var fb = new Firebase(connectionConfig.fbURL);
      fb.authAnonymously(function(err, authData) {
        if (err) {
          console.log("Error connecting to Firebase.");
          process.exit();
        } else {
          console.log("* Connected to Firebase.");
          fb.child("config").on("value", function(snapshot) {
            config = snapshot.val();
            if (config.loop === true) {
              if (intervalId) {
                clearInterval(intervalId);
                intervalId = undefined;
              }
              intervalId = setInterval(loopTick, config.loopSleep * 1000);
            } else {
              if (intervalId) {
                clearInterval(intervalId);
                intervalId = undefined;
              }
            }
          });
          fb.child("urlsToLoop").on("value", function(snapshot) {
            loopUrls = snapshot.val();
          });
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
