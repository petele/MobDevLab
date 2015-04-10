'use strict';

var ConfigModel = require('./../model/ConfigModel.js');
var URLModel = require('./../model/URLModel.js');
var DeviceModel = require('./../model/DeviceModel.js');
var BrowserIntentHelper = require('./../helper/BrowserIntentHelper.js');
var Firebase = require('firebase');

var config = require('./../config.json');

function ClientController() {
  var configModel;
  var urlModel;
  var deviceModel = new DeviceModel();

  var firebase = new Firebase(config.firebaseUrl);
  firebase.authWithCustomToken(config.firebaseKey, function(err, authToken) {
    if (err) {
      throw new Error(err);
    }

    urlModel = new URLModel(firebase);
    configModel = new ConfigModel(firebase);

    urlModel.on('URLChange', function(url) {
      this.presentUrl(url);
    }.bind(this));

    configModel.on('ModeChange', function(mode) {
      switch (mode) {
        case 'loop':
          
          break;
        case 'static':
          
          break;
        case 'config':
          console.log('We need to do something for config');
          break;
      }
    }.bind(this));
  }.bind(this));

  this.getDeviceModel = function() {
    return deviceModel;
  };
}

ClientController.prototype.presentUrl = function(url) {
  var intentHandler = BrowserIntentHelper.getDeviceIntentHandler(url);
  this.getDeviceModel().launchIntentOnAllDevices(intentHandler);
};

module.exports = ClientController;
