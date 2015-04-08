var fs = require("fs");
var Firebase = require("firebase");
var webRequest = require("./webRequest");

var fb, apiKeys, runLoop, loopInterval, intervalId, loopURLs, loopCounter;

function loopTick() {
  var loopIndex = loopCounter++ % loopURLs.length;
  var newURL = loopURLs[loopIndex];
  var item = {
    "url": newURL,
    "date": Date.now(),
    "runTests": false,
    "source": "looper"
  };
  fb.child("url").push(item);
  console.log(newURL);
  if (runLoop === true) {
    intervalId = setTimeout(loopTick, loopInterval * 1000);
  }
}

function stopLooper() {
  runLoop = false;
  if (intervalId) {
    console.log("* Looper Stopped");
    clearTimeout(intervalId);
    intervalId = null;
  }
}

function startLooper() {
  console.log("* Looper Started");
  if (intervalId) {
    stopLooper();
  }
  runLoop = true;
  loopTick();
}

function createPSIURI(url, strategy) {
  var uri = {
    "host": "www.googleapis.com",
    "secure": true
  };
  uri.path = "/pagespeedonline/v3beta1/runPagespeed?";
  uri.path += "key=" + apiKeys.psi;
  uri.path += "&screenshot=false&snapshots=false&locale=en_US";
  uri.path += "&filter_third_party_resources=false";
  uri.path += "&strategy=" + strategy;
  uri.path += "&url=" + encodeURIComponent(url);
  return uri;
}

function createWPTURI(url, mobile) {
  var uri = {
    "host": "www.webpagetest.org",
    "secure": true
  };
  uri.path = "/runtest.php?";
  uri.path += "k=" + apiKeys.wpt;
  uri.path += "&f=json";
  if (mobile) {
    uri.path += "&mobile=1";
  }
  uri.path += "&url=" + encodeURIComponent(url);
  return uri;
}

function runTests(urlRef) {
  var val = urlRef.val();
  console.log("Running tests for:", val.url);
  var psiMobile = createPSIURI(val.url, "mobile");
  webRequest.request(psiMobile, undefined, function(r) {
    if (r.kind === "pagespeedonline#result") {
      var result = {
        "score": {
          "speed": r.ruleGroups.SPEED.score,
          "ux": r.ruleGroups.USABILITY.score
        },
        "pageStats": r.pageStats
      };
      urlRef.ref().child("score/mobile/psi").set(result);
    }
  });
  var psiDesktop = createPSIURI(val.url, "desktop");
  webRequest.request(psiDesktop, undefined, function(r) {
    if (r.kind === "pagespeedonline#result") {
      var result = {
        "score": {
          "speed": r.ruleGroups.SPEED.score
        },
        "pageStats": r.pageStats
      };
      urlRef.ref().child("score/desktop/psi").set(result);
    }
  });
  var wptMobile = createWPTURI(val.url, true);
  webRequest.request(wptMobile, undefined, function(r) {
    if (r.data) {
      var result = {
        "testId": r.data.testId,
        "jsonUrl": r.data.jsonUrl
      };
      urlRef.ref().child("score/mobile/wpt").set(result);
    }
  });
  var wptDesktop = createWPTURI(val.url, false);
  webRequest.request(wptDesktop, undefined, function(r) {
    if (r.data) {
      var result = {
        "testId": r.data.testId,
        "jsonUrl": r.data.jsonUrl
      };
      urlRef.ref().child("score/desktop/wpt").set(result);
    }
  });
  urlRef.ref().child("runTests").set(false);
}


function init() {
  console.log("Device Lab Service Manager");
  runLoop = false;
  loopInterval = null;
  intervalId = null;
  loopURLs = [];
  loopCounter = 0;
  apiKeys = {};
  fs.readFile("./config.json", {"encoding": "utf8"}, function(err, data) {
    if (err) {
      console.log("* Error reading connection settings file.", err);
      process.exit();
    } else {
      console.log("* Config file parsed.");
      var cnxSettings = JSON.parse(data);
      fb = new Firebase(cnxSettings.fbURL);
      fb.authWithCustomToken(cnxSettings.fbKey, function(err, authToken) {
        if (err) {
          console.log("* Firebase connection failed.", err);
          process.exit();
        } else {
          console.log("* Connected to Firebase.");
          fb.child("config/apiKeys").on("value", function(snapshot) {
            apiKeys = snapshot.val();
          });
          fb.child("urlsToLoop").on("value", function(snapshot) {
            loopURLs = snapshot.val();
          });
          fb.child("config/loopInterval").on("value", function(snapshot) {
            loopInterval = snapshot.val();
          });
          fb.child("config/loop").on("value", function(snapshot) {
            var val = snapshot.val();
            if (val === true) {
              startLooper();
            } else {
              stopLooper();
            }
          });
          fb.child("url").limitToLast(1).on("child_added", function(snapshot) {
            var val = snapshot.val();
            if ((val.url) && (val.runTests === true)) {
              runTests(snapshot);
            }
          });
        }
      });
    }
  });
}



init();