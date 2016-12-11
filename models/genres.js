var mongoose = require('mongoose');

var GenresSchema = new mongoose.Schema({
  name: String,
  popularity: Number,
  tracks: [
    {
      name: String,
      trackId: String
    }
  ]
});

var Genres = mongoose.model('Genres', GenresSchema);

module.exports = {
  Genres: Genres
};
