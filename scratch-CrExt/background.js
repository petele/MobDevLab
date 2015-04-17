/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 * Mini Mobile Device Lab
 * https://github.com/GoogleChrome/MiniMobileDeviceLab
 * background.js
 *
 **/


// is the extension enabled & running
var isEnabled = false;


// handle to the current tab
var currentTab;

function openURL(url) {
  var tabOptions = {
    url: url,
    active: true
  };
  if (currentTab === undefined) {
    tabOptions.index = 0;
    console.log("[OpenURL] (New)", tabOptions);
    chrome.tabs.create(tabOptions, function(newTab) {
      currentTab = newTab;
    });
  } else {
    console.log("[OpenURL] (Existing)", tabOptions);
    chrome.tabs.update(currentTab.id, tabOptions, function(newTab) {
      // Checks if there was an error, if there was, attempt to reopen
      // the url on a new tab.
      if (chrome.runtime.lastError) {
        currentTab = undefined;
        openURL(url);
      } else {
        // Updates the tab in case it changed due to preloading, etc
        currentTab = newTab;
      }
    });
  }
}


function init() {
  console.log("[Init]")
  chrome.storage.sync.get("fbCnxSettings", function(settings) {
    if (settings.fbCnxSettings === undefined) {
      console.log("[Init] Creating default settings");
      var fbCnxSettings = {
        "fbCnxSettings": {
          "appID": "shining-inferno-4243",
          "key": "",
          "onByDefault": true
        }
      };
      chrome.storage.sync.set(fbCnxSettings);
      settings = fbCnxSettings;
    }

    settings = settings.fbCnxSettings;
    console.log("[Init] Settings: ", settings);
    
    try {
      setEnabled(settings.onByDefault);
      var fbURL = "https://" + settings.appID + ".firebaseio.com/";
      var fb = new Firebase(fbURL);
      if (settings.key === "") {
        fb.authAnonymously(function(err, authToken) {
          console.log("Anonymous Auth:", err, authToken);
          if (err) {
            openURL("setup.html");
          }
        });
      } else {
        fb.authWithCustomToken(settings.key, function(err, authToken) {
          console.log("Custom Token Auth:", err, authToken);
          if (err) {
            openURL("setup.html");
          }
        });
      }
      fb.child("url").limitToLast(1).on("child_added", function(snapshot) {
        if (isEnabled) {
          openURL(snapshot.val().url);
        }
      });
    } catch (ex) {
      openURL("setup.html");
    }
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === "ready") {
    currentTab = undefined;
    chrome.tabs.remove(sender.tab.id);
    init();
  }
});

function setEnabled(enabled) {
  if (enabled === undefined) {
    enabled = !isEnabled;
  }
  console.log("[SetEnabled]", enabled);
  if (enabled === true) {
    isEnabled = true;
    chrome.browserAction.setBadgeText({"text": "ON"});
    chrome.power.requestKeepAwake("display");
  } else if (enabled === false) {
    isEnabled = false;
    chrome.browserAction.setBadgeText({"text": ""});
    chrome.power.releaseKeepAwake();
  }
}

chrome.browserAction.onClicked.addListener(function(tabs) {
  setEnabled();
});

init();