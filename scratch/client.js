var fs = require("fs");
var Firebase = require("firebase");
var adb = require("adbkit");

var devices, adbClient;

var startKSOIntent = {
  "wait": true,
  "action": "android.intent.category.LAUNCHER",
  "component": "com.synetics.stay.alive/.main"
};

function createOpenWithChromeIntent(url) {
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
  return intent;
}

function addDevice(device) {
  var url = 'data:text/html,<html><head>';
  url += '<meta name="viewport" content="width=device-width,initial-scale=1">';
  url += '<style>h1 { font-size: 55vw; text-align: center; ';
  url += 'font-family: Roboto; }</style>';
  url += '</head><body>';
  url += '<div><h1>:)</h1></div>';
  url += '</body></html>';
  if ((device.type === "device") && (devices.indexOf(device.id) === -1)) {
    devices.push(device.id);
    console.log("+", device.id);
    // adbClient.startActivity(device.id, startKSOIntent);
    var intent = createOpenWithChromeIntent(url);
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
  console.log("->", intent.data, devices.length);
  for (var i = 0; i < devices.length; i++) {
    adbClient.startActivity(devices[i], intent);
  }
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
  console.log("Device Lab Client");
  devices = [];
  adbClient = adb.createClient();
  initDeviceWatcher();
  fs.readFile("./config.json", {"encoding": "utf8"}, function(err, data) {
    if (err) {
      console.log("* Error reading connection settings file.", err);
      process.exit();
    } else {
      console.log("* Config file parsed.");
      var cnxSettings = JSON.parse(data);
      var fb = new Firebase(cnxSettings.fbURL);
      fb.authAnonymously(function(err, authToken) {
        if (err) {
          console.log("* Firebase connection failed.", err);
          process.exit();
        } else {
          console.log("* Connected to Firebase.");
          fb.child("url").limitToLast(1).on("child_added", function(snapshot) {
            var val = snapshot.val();
            if (val.url) {
              var intent = createOpenWithChromeIntent(val.url);
              sendIntentToDevices(intent);
            }
          });
        }
      });
    }
  });
}



init();