var adb = require('adbkit');
var adbClient = adb.createClient();

var options = {
  "wait": false,
  "action": "android.intent.action.VIEW",
  "component": "com.android.chrome/com.google.android.apps.chrome.Main",
  "flags": [0x10000000],
  "extras": [
    {"key": "com.android.browser.application_id", "type": "string", "value": "com.android.chrome"}
  ]
};

function logIt(a, b, c) {
  console.log("LogIt", a, b, c);
}

function openURL(device, url) {
  console.log("openURL", device, url);
  options.data = url;
  adbClient.startActivity(device, options, logIt);
}


adbClient.listDevices(function(err, dev) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Devices", dev);
    //options.data = "https://www.unb.ca";
    for (var i = 0; i < dev.length; i++) {
      openURL(dev[i].id, "https://www.google.ca");
      // adbClient.startActivity(dev[i].id, options, logIt);
    }
  }
});