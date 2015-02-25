var adb = require('adbkit');
var adbClient = adb.createClient();



function logIt(a, b, c) {
  console.log("LogIt", a, b, c);
}

var intentAddAccount = {
  "wait": true,
  "action": "android.settings.ADD_ACCOUNT_SETTINGS",
  "extras": [
    {
      "key": "account_types",
      "type": "string",
      "value": ["com.google"]
    }
  ]
};

var intentDisplay = {
  "wait": false,
  "action": "android.settings.DISPLAY_SETTINGS",
};

var intentWiFi = {
  "wait": false,
  "action": "android.settings.WIFI_SETTINGS",
};

adbClient.listDevices(function(err, dev) {
  if (err) {
    console.log("Error", err);
  } else {
    for (var i = 0; i < dev.length; i++) {
      var device = dev[i];
      console.log(device);
      adbClient.startActivity(device.id, intentAddAccount, function(a, b) {
        console.log("A")
        var cmd = "input keyevent 36";
        adbClient.shell(device.id, cmd);
      });

    }
  }
});