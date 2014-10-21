var setup = exports.setup = require('./advanced_cfg.json');

exports.routine = {
  onMinAmountOfOwnedGames: function(data) {
    var val = data.response.game_count;
    return (val >= setup.MinAmountOfOwnedGames.expectedValue);
  }
};
