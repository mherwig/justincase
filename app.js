var Rcon = require('rcon');
var events = require('events');
var readline = require('readline');

var eventEmitter = new events.EventEmitter();

var config = require('./config.json');

var steamPlugin = require('./plugins/steam/plugin.js');
steamPlugin.init(eventEmitter);

var conn = new Rcon(config.rcon.host, config.rcon.port, config.rcon.password);
conn.on('auth', function() {
  console.log("Successfully authed.");
}).on('response', function(str) {
  if (str !== "") {
    console.log("Got response: " + str);
    // TODO: get steamid when someone joins the server
    // steamPlugin.check(steamid);
  }
}).on('end', function() {
  console.log("Socket closed.");
  process.exit();
});

conn.connect();

// for testing
var steamid = "76561197971702611";
var reason = "u mad?";
steamPlugin.check(steamid);

eventEmitter.on('passed', function(result) {
  if (result === false) {
    // kick and ban, you might want to alter this rcon commends
    conn.send("banid " + result.steamid + " " + reason);
    conn.send("kick " + result.steamid);
    console.log("Player with steamid " + result.steamid + " FAILED " + result.check + " check.");
    console.log("Kicked and banned " + result.steamid);
  } else {
    console.log("Player with steamid " + result.steamid + " PASSED " + result.check + " check.");
  }
});

/*
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.prompt();
rl.on('line', function (cmd) {
  conn.send(cmd);
});
*/
