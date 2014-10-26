justincase
==========

A Node.js script that kicks and bans player from multiplayer games using rcon based on (steam) profile metrics.

*Note: This project is in a very early and experimental stage.*

## Configuration

1. Add your rcon credentials (host, port and password) to `config.json`.
2. Add your Steam Web API key to `plugins/steam/config.json`. You can get your own API key here: http://steamcommunity.com/dev/apikey

## Install dependencies

    $ npm install


## Run the application

    $ node ./app.js

## Add a new plugin profile

This is a quick howto for adding a new profile to the Steam plugin. Currently the Steam plugin is the only justincase plugin, its purpose is to kick and ban people based on information you get get from their Steam community profile.

Create the following new empty files `plugins/steam/advanced_cfg.json` and `plugins/steam/advanced_impl.js`.
The first one is for configuration and the other one is for the implementation. Note that these file names are following a naming convention ('_cfg.json'-ending for configuratiion files and the '_impl.js'-ending for implementation files).

*plugins/steam/advanced_cfg.json:*
```
{
  "MinAmountOfOwnedGames": {
    "url": " http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/",
    "singleSubject": true,
    "params": {},
    "expectedValue": 2,
    "enabled": true
  }
}
```
`url`: Stem Web API url without arguments

`singleSubject`: Whether or not to inject 'steamid' instead of 'steamids' as argument

`params`: Extra arguments

`expectedValue`: The value you are interested in

`enabled`: If set false the corresponding implementation gets ignored


*plugins/steam/advanced_impl.js:*
```
var setup = exports.setup = require('./advanced_cfg.json');

exports.routine = {
  onMinAmountOfOwnedGames: function(data) {
    var val = data.response.game_count;
    return (val >= setup.MinAmountOfOwnedGames.expectedValue);
  }
};
```
**Note:** The function name and the corresponding key in the json file must be same with the exception that you have to prepend 'on' to the function name.

The return value must be boolean and therefore `true` or `false`. You should use a comparison with a positive schema, so that the return value will be `true` if the requested data conforms to your `expectedValue`.

*plugins/steam/config.json:*
```
{
  "key": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "format": "json",
  "profiles": ["basic", "advanced"]
}
```

Add your new profile to plugin's config as seen above.

## Compatibility

Currently successfully tested with "Fistful Of Frags" (Source engine). 

## TODO

* scheduled for Februrary 2015 *

* Automatic rcon reconnection when disconnected (e.g. at map change of source games)
* Whitelist implementions
* Plugin system: Support for different steamid retrieval ways
* Plugin system: Support for different rcon command sets
* Ban/Kick logging
* Ban Appeal web interface
* Refactoring (make everything more easy and comfortable)
