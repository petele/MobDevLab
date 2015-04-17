function mmdlTestForServiceWorker() {
  console.log("mmdlTestForServiceWorker");
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(function(registration) {
      if (registration) {
        chrome.runtime.sendMessage({
          serviceWorkerTest: true,
          hasServiceWorker: true,
          url: window.location.href
        });
      } else {
        chrome.runtime.sendMessage({
          serviceWorkerTest: true,
          hasServiceWorker: false,
          url: window.location.href
        });
      }
    }).catch(function(err) {
      chrome.runtime.sendMessage({
        serviceWorkerTest: true,
        hasServiceWorker: false,
        url: window.location.href,
        "error": err
      });
    });
  }
}

mmdlTestForServiceWorker();