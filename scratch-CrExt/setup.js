
var inputAppID = document.querySelector("#appID");
var inputKey = document.querySelector("#key");
var inputOnByDefault = document.querySelector("#onByDefault");

document.querySelector("#butSave").addEventListener("click", function() {
  var fbCnxSettings = {
    "fbCnxSettings": {
      "appID": inputAppID.value,
      "key": inputKey.value,
      "onByDefault": inputOnByDefault.checked
    }
  };

  chrome.storage.sync.set(fbCnxSettings, function() {
    chrome.runtime.sendMessage({message: "ready"});
  });
});

document.querySelector("#butClear").addEventListener("click", function() {
  inputKey.value = "";
  inputAppID.value = "";
  inputOnByDefault.checked = true;
  chrome.storage.sync.clear();
});

chrome.storage.sync.get("fbCnxSettings", function(settings) {
  if (settings.fbCnxSettings !== undefined) {
    settings = settings.fbCnxSettings;
    inputAppID.value = settings.appID;
    inputKey.value = settings.key;
    if (settings.onByDefault === true) {
      inputOnByDefault.checked = true;
    } else {
      inputOnByDefault.checked = false;
    }
  }
});