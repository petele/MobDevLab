'use strict';

var ConfigModel = require('./../model/ConfigModel.js');
var URLModel = require('./../model/URLModel.js');
var LoopSettingsModel = require('./../model/LoopSettingsModel.js');
var Firebase = require('firebase');

var config = require('./../config.json');

function ServerController() {
  var configModel;
  var urlModel;
  var loopSettingsModel;
  var loopIndex = 0;
  var loopTimeoutId;

  var firebase = new Firebase(config.firebaseUrl);
  firebase.authWithCustomToken(config.firebaseKey, function(err, authToken) {
    if (err) {
      throw new Error(err);
    }

    loopSettingsModel = new LoopSettingsModel(firebase);
    urlModel = new URLModel(firebase);
    configModel = new ConfigModel(firebase);

    configModel.on('ModeChange', function(mode) {
      if (mode === 'loop') {
        this.startLooping();
      } else {
        this.stopLooping();
      }

      // TODO: Handle config
    }.bind(this));
  }.bind(this));

  this.getFirebase = function() {
    return firebase;
  };

  this.getUrlModel = function() {
    return urlModel;
  };

  this.getLoopSettingsModel = function() {
    return loopSettingsModel;
  };

  this.getLoopIndex = function() {
    return loopIndex;
  };

  this.setLoopIndex = function(newIndex) {
    loopIndex = newIndex;
  };

  this.getLoopTimeoutId = function() {
    return loopTimeoutId;
  };

  this.setLoopTimeoutId = function(newId) {
    loopTimeoutId = newId;
  };

  this.getConfigModel = function() {
    return configModel;
  };
}

ServerController.prototype.startLooping = function() {
  console.log('MainController: Start Looping');

  this.performLoopTick();
};

ServerController.prototype.performLoopTick = function() {
  var loopSettingsModel = this.getLoopSettingsModel();
  var timeoutMs = loopSettingsModel.getLoopIntervalMs();
  var loopUrls = loopSettingsModel.getLoopUrls();
  var loopIndex = this.getLoopIndex() % loopUrls.length;

  // Clear any current pending timeout
  var currentTimeoutId = this.getLoopTimeoutId();
  if (currentTimeoutId) {
    clearTimeout(currentTimeoutId);
  }

  this.getUrlModel().setNewUrl(loopUrls[loopIndex]);

  var newTimeoutId = setTimeout(this.performLoopTick.bind(this), timeoutMs);
  this.setLoopTimeoutId(newTimeoutId);
  this.setLoopIndex(loopIndex + 1);
};

ServerController.prototype.stopLooping = function() {
  console.log('MainController: Stop Looping');
  var currentTimeoutId = this.getLoopTimeoutId();
  if (currentTimeoutId) {
    clearTimeout(currentTimeoutId);
  }
  this.setLoopTimeoutId(null);

  var singleUrl = this.getUrlModel().getUrl();
  
};

// TODO: Expose this via some sort of API or front end
ServerController.prototype.setStaticUrl = function(url) {
  var configModel = this.getConfigModel();
  if (configModel.getMode() === 'loop') {
    console.log('Can\'t set the url while the lab is looping');
    return;
  }

  this.getUrlModel().setNewUrl(url);
};

module.exports = ServerController;
