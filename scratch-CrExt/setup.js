
var inputURL = document.querySelector("#url");
var inputKey = document.querySelector("#key");
var inputOnByDefault = document.querySelector("#onByDefault");

document.querySelector("#butSave").addEventListener("click", function() {
  var fbCnxSettings = {
    "fbCnxSettings": {
      "key": inputKey.value,
      "url": inputURL.value,
      "onByDefault": inputOnByDefault.checked
    }
  };

  chrome.storage.sync.set(fbCnxSettings, function() {
    chrome.runtime.sendMessage({message: "ready"});
  });
});

document.querySelector("#butClear").addEventListener("click", function() {
  inputKey.value = "";
  inputURL.value = "";
  inputOnByDefault.checked = true;
  chrome.storage.sync.clear();
});

chrome.storage.sync.get("fbCnxSettings", function(settings) {
  if (settings.fbCnxSettings !== undefined) {
    settings = settings.fbCnxSettings;
    inputURL.value = settings.url;
    inputKey.value = settings.key;
    if (settings.onByDefault === true) {
      inputOnByDefault.checked = true;
    } else {
      inputOnByDefault.checked = false;
    }
  }
});