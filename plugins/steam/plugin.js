var request = require('request');
var config = require('./config.json');

var implementations = [];
var eventEmitter = null;
var isGuilty = false;

exports.init = function(ee) {
  eventEmitter = ee;
  for (var i in config.profiles) {
    var implName = config.profiles[i];
    implementations.push(require("./" + implName + "_impl.js"));
  }
};

var pass = function(user, data, funcName, func) {
  var hasPassed = func(JSON.parse(data));
  var result = {
    user: user,
    check: funcName,
    hasPassed: hasPassed
  };
  if (hasPassed === false) isGuilty = true;
  eventEmitter.emit('passed', result);
};

function doRequest(user, url, params, singleSubject, funcName, func) {
  var urlWithParams = url + "?";

  for (var param in params) {
    var paramString = param + "=" + params[param];
    urlWithParams += paramString;
    urlWithParams += "&";
  }

  urlWithParams += "key=" + config.key;

  if (singleSubject === true) {
    urlWithParams += "&steamid=" + user.communityid;
  } else {
    urlWithParams += "&steamids=" + user.communityid;
  }

  urlWithParams += "&format=" + config.format;

  request(urlWithParams, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      pass(user, body, funcName, func);
    }
  });
}

exports.check = function(user) {
  for (var i in implementations) {
    var routineChecks = implementations[i].setup;

    for (var r in routineChecks) {
      if (routineChecks[r].enabled === true) {
        var url = routineChecks[r].url;
        var params = routineChecks[r].params;
        var singleSubject = routineChecks[r].singleSubject;
        var func = implementations[i].routine["on" + r];

        if (isGuilty === false) {
          doRequest(user, url, params, singleSubject, r, func);
        } else {
          break;
        }
      }
    }
  }
};
