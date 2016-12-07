var mongoose = require('mongoose');
var User = mongoose.model('Users');
var Song = mongoose.model('Songs');
var PriorityQueue = require('fastpriorityqueue');

function Genre(genre, count) {
  this.genre = genre;
  this.count = count;
}

function getGenres() {
  return new Promise(function(resolve, reject) {
    Song.find({}, function(err, songs, count) {
      if (err) {
        reject(Error(err));
      } else {
        console.log('Finished with genres');
        resolve(_getGenres(songs));
      }
    });
  });
}

function _getGenresPQ(genresObj) {
  var pq = new PriorityQueue(function(a, b) { return a.count > b.count } ); // max-heap

  for (var key in genresObj) {
    pq.add(new Genre(key, genresObj[key]));
  }

  return pq;
}

function _getGenres(songs) {
  var genresObj = _getGenresObj(songs);
  var genrePQ = _getGenresPQ(genresObj);
  var genresArr = _getGenresArr(genrePQ);

  return genresArr;
}

function _getGenresArr(genresPQ) {
  var genresArr = [];

  for (var i = 0; i < 10; ++i) {
    var genre = genresPQ.poll();
    var genreObj = {};
    genreObj[genre.genre] = genre.count;

    genresArr.push(genreObj);
  }

  return genresArr;
}

function _getGenresObj(songs) {
  var genresObj = {};

  songs.forEach(function(song) {
    var songGenres = song.genres;
    songGenres.forEach(function(genre) {
      genre = genre.replace(/\s+/g, '-');

      if (genresObj.hasOwnProperty(genre)) {
        genresObj[genre] = genresObj[genre] + 1;
      } else {
        genresObj[genre] = 1;
      }
    });
  });

  return genresObj;
}

module.exports = {
  getGenres: getGenres
};
