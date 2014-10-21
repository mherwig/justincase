var events = require('events');
var readline = require('readline');
var bignum = require('bignum');
var Rcon = require('simple-rcon');

var info = require('./package.json');
info.tag = "[" + info.name + " v" + info.version + "]";

var eventEmitter = new events.EventEmitter();

var config = require('./config.json');

var steamPlugin = require('./plugins/steam/plugin.js');
steamPlugin.init(eventEmitter);

var conn = new Rcon(config.rcon.host, config.rcon.port, config.rcon.password);

var lastCheckedId = "";

function getServerStatus() {
  conn.exec('status', function(res) {
    console.log("Checking now...");
    var userStatusLineRegex = /(#\s+\d+ ".+"\s+STEAM.+)/g;
    var usernameRegex = /#\s+\d+ "(.+)"\s+STEAM.+/;
    var userConnectedTimeRegex = /STEAM_\d+:\d+:\d+\s+(\d+:\d+)/;
    var userSteamIdRegex = /(STEAM_\d+:\d+:\d+)/;

    var userStatusLines = userStatusLineRegex.exec(res.body);

    if (userStatusLines === null) return;

    var minValue = 1;
    var steamid = null;
    var username = "";

    while (userStatusLines !== null) {
      var userConnectedTime = userConnectedTimeRegex.exec(userStatusLines[1])[1];
      var minute = userConnectedTime.split(":")[0];

      if (parseInt(minute) < minValue) {
        steamid = userSteamIdRegex.exec(userStatusLines[1])[1];
        username = usernameRegex.exec(userStatusLines[1])[1];
      }
      userStatusLines = userStatusLineRegex.exec(res.body);
    }

    if (steamid === null) return;

    var communityid = convertToCommunityId(steamid);

    if (steamid !== lastCheckedId) {
      console.log("Checking profile: http://steamcommunity.com/profiles/" + communityid);
      conn.exec("say " + info.tag + " Checking profile of user " + username);
      steamPlugin.check({steamid: steamid, communityid: communityid, username: username});
      lastCheckedId = steamid;
    }
  });
}

function convertToCommunityId(str) {
  var splittedId = str.split(":");
  var profileIdentifier64 = bignum('76561197960265728');
  var communityid = profileIdentifier64.add(splittedId[2] * 2).add(splittedId[1]);

  return communityid.toString();
}

conn.on('authenticated', function() {
  console.log("Successfully authed.");
  getServerStatus();
  setInterval(getServerStatus, 60 * 1000);
});

conn.on('error', function(error) {
  console.log(error);
});

conn.on('disconnected', function() {
  console.log('Disconnected from server!');
  // TODO: Reconnect after some time
  conn.close();
});

var reason = "Suspicious Steam profile. Yeah, we ban on spec.";

eventEmitter.on('passed', function(result) {
  if (result.hasPassed === false) {
    // kick and ban, you might want to alter this rcon commends
    conn.exec("banid 0" + result.user.steamid + " kick ");
    console.log("Player with steamid " + result.user.steamid + " FAILED " + result.check + " check.");
    console.log("Kicked and banned " + result.user.username);
    conn.exec("say " + info.tag + " Kicked and banned user " + result.user.username);
  } else {
    console.log("Player with steamid " + result.user.steamid + " PASSED " + result.check + " check.");
  }
});

process.on('SIGINT', function() {
  conn.close();
  process.exit(0);
});
