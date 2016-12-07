var mongoose = require('mongoose');

var SongsSchema = new mongoose.Schema({
  genres: [ String ],
  popularity: Number,
  trackId: String,
  artistIds: [ String ],
  users: [ String ],
  trackName: String // human readability
});

var Songs = mongoose.model("Songs", SongsSchema);

module.exports = {
  Songs: Songs
};
