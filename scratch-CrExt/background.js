console.log("-------------- START -------------");

var currentTab;
var isEnabled = false;

function openURL(url) {
  var tabOptions = {
    url: url,
    active: true
  };
  if (currentTab === undefined) {
    tabOptions.index = 0;
    chrome.tabs.create(tabOptions, function(newTab) {
      currentTab = newTab;
    });
  } else {
    chrome.tabs.update(currentTab.id, tabOptions, function(newTab) {
      if (chrome.runtime.lastError) {
        currentTab = undefined;
        openURL(url);
      } else {
        currentTab = newTab;
      }
    });
  }
}


function init() {
  chrome.storage.sync.get("fbCnxSettings", function(settings) {
    if (settings.fbCnxSettings === undefined) {
      openURL("setup.html");
    } else {
      settings = settings.fbCnxSettings;
      try {
        setEnabled(settings.onByDefault);
        var fb = new Firebase(settings.url);
        fb.authWithCustomToken(settings.key, function(err, authToken) {
          if (err) {
            openURL("setup.html");
          }
        });
        fb.child("url").limitToLast(1).on("child_added", function(snapshot) {
          if (isEnabled) {
            openURL(snapshot.val().url);
          }
        });
      } catch (ex) {
        openURL("setup.html");
      }
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
    setEnabled(!isEnabled);
  } else if (enabled === true) {
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