var adb = require('adbkit');
var adbClient = adb.createClient();

var pkg = "com.synetics.stay.alive";
var intentInstall = {
  "wait": false,
  "action": "android.intent.action.VIEW",
  "data": "market://details?id=com.synetics.stay.alive"
};
var intentStart = {
  "wait": false,
  "action": "android.intent.category.LAUNCHER",
  "component": "com.synetics.stay.alive/.main"
};

adbClient.listDevices(function(err, dev) {
  if (err) {
    console.log("Error", err);
  } else {
    for (var i = 0; i < dev.length; i++) {
      var deviceId = dev[i].id;
      adbClient.isInstalled(deviceId, pkg, function(err, installed) {
        if (err) {
          console.log("Error", deviceId, err);
        } else {
          if (installed === true) {
            adbClient.startActivity(deviceId, intentStart);
          } else {
            adbClient.startActivity(deviceId, intentInstall);
          }
        }
      });
    }
  }
});