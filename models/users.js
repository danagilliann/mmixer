var mongoose = require('mongoose');

var UsersSchema = new mongoose.Schema({
  spotifyId: String,
  token: String,
  tracks: [
    {
      trackId: String,
      artistIds: [ String ],
      genres: [ String ],
      trackName: String // human readability
    }
  ]
});

var Users = mongoose.model("Users", UsersSchema);

module.exports = {
  Users: Users
};
