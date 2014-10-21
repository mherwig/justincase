var setup = exports.setup = require('./basic_cfg.json');

exports.routine = {
  onCommunityVisibilityState: function(data) {
    var val = data.response.players[0].communityvisibilitystate;
    return (val === setup.CommunityVisibilityState.expectedValue);
  },
  onVACBan: function(data) {
    var val = data.players[0].VACBanned;
    return (val === setup.VACBan.expectedValue);
  },
  onMinDaysSinceLastBan: function(data) {
    var val = data.players[0].DaysSinceLastBan;
    return (val >= setup.MinDaysSinceLastBan.expectedValue);
  }
};
