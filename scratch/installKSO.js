var adb = require('adbkit');
var adbClient = adb.createClient();

var pkg = "com.synetics.stay.alive";
var intentInstall = {
  "wait": true,
  "action": "android.intent.action.VIEW",
  "data": "market://details?id=com.synetics.stay.alive"
};
var intentStart = {
  "wait": true,
  "action": "android.intent.category.LAUNCHER",
  "component": "com.synetics.stay.alive/.main"
};

function checkAndInstall(deviceId) {
  adbClient.startActivity(deviceId, intentStart, function(err, result) {
    console.log(deviceId, result);
    if (err) {
      adbClient.startActivity(deviceId, intentInstall);
    }
  });
}

adbClient.listDevices(function(err, dev) {
  if (err) {
    console.log("Error", err);
  } else {
    for (var i = 0; i < dev.length; i++) {
      var deviceId = dev[i].id;
      checkAndInstall(deviceId);
    }
  }
});