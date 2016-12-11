var mongoose = require('mongoose');

var GenresSchema = new mongoose.Schema({
  name: { type: String, unique : true },
  popularity: Number,
  tracks: [
    {
      name: String,
      trackId: String
    }
  ],
  users: [ String ]
});

var Genres = mongoose.model('Genres', GenresSchema);

module.exports = {
  Genres: Genres
};
