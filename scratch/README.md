
# Using the scripts

## ServiceManager

You only need one `serviceManager.js` running per instance of Firebase. 
Service Manager primarily handles looping, but also manages automatic page 
testing. When it detects a new URL has been pushed (either through the looper 
or manually), it will test the page with PageSpeed Insights and Web Page Test,
and then add the results to the Firebase URL node.

## Client

`client.js` listens for new URLs to be pushed to Firebase and then fires an
Intent via ADB to open the default browser on each of the connected devices with
the supplied URL.  If devices are connected to multiple computers, you'll need
to run client.js on each computer that has Android devices connected via ADB.

## Config

A `config.json` file is needed to tell all of the scripts how to connect to
Firebase, including the Firebase URL and the auth key. This file should not be
checked into GitHub because it contains senstive information.

```
{
  "fbURL": "https://shining-inferno-4243.firebaseio.com/",
  "fbKey": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

## Sending URLs
To manually send a URL to the script, use `send.js`


# Other Scripts

## clean.js

Cleans the list of tested URLs from Firebase, essentially 
`fb.child("url").remove()`

## installKSO.js

Fires an intent to any device connected to the computer to install
[Stay Awake](https://play.google.com/store/apps/details?id=com.synetics.stay.alive)

