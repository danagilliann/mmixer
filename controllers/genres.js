var mongoose = require('mongoose');
var User = mongoose.model('Users');
var Song = mongoose.model('Songs');
var Genre = mongoose.model('Genres');
// var PriorityQueue = require('fastpriorityqueue');

// function Genre(genre, count) {
//   this.genre = genre;
//   this.count = count;
// }

function getGenre() {
  Song.find({}, (err, songs) => {
    console.log(songs);
  });
}

function getGenres() {
  console.log('in getGenres');
  return new Promise(function(resolve, reject) {
    console.log('in promise');
    Genre.find({}).sort({ popularity: -1 }).exec(function(err, genres) {
      var genreArr = [];
      for (var i = 0; i < 10; ++i) {
        var genreCountObj = {};
        genreCountObj[genres[i].name.replace(/\s+/g, '-')] = genres[i].popularity;
        genreArr.push(genreCountObj);
      }
      console.log('genreArr ', genreArr);
      // mongoose.disconnect();
      resolve(genreArr);
    });

  });
}

module.exports = {
  getGenres: getGenres,
  getGenre: getGenre
};
