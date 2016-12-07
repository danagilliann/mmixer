var mongoose = require('mongoose');
var User = mongoose.model('Users');
var Song = mongoose.model('Songs');
var request = require('request');
// var db = require('./controllers/db');

function updateDb(userId, token) {
  return new Promise(function(resolve, reject) {
    _getTracks(userId, token).then(function(tracks) {
      console.log('will updateUser');
      _updateUser(tracks, userId, token); // TODO: Maybe make a promise here?
      return tracks;
    }).then(function(tracks) {
      console.log('will updateSongs');
      _updateSongs(tracks, userId);
      resolve('successfully updated');
    });
  });
}

function _updateSongs(tracks, userId) {
  console.log('in update songs');
  for (var i in tracks) {
    _updateSongsDb(tracks[i].trackId, tracks[i], userId, i);
  }
}

function _updateSongsDb(songId, trackObj, userId, trackInd) {
  Song.findOne({ trackId: songId }, function(err, song, count) {
    if (song === null) { // mongo uses null
      var newSong = new Song({
          genres: trackObj.genres,
          popularity: 1,
          trackId: trackObj.trackId,
          artistIds: trackObj.artistIds,
          users: [ userId ],
          trackName: trackObj.trackName
      });

      newSong.save(function(err, song, count) {
        if (err) {
          console.error('Error in saving new Song', err);
        } else {
          console.log('Successfully saved new song', song.trackId);
          if (trackInd === 9) { // prevent early disconnection
            mongoose.disconnect();
          }
        }
      });
    } else {
      if (!song.users.includes(userId)) {
        var songUsers = song.users;
        songUsers.push(userId);
        song.users = songUsers;
        song.popularity = song.popularity + 1;

        song.save(function(err, song, count) {
          if (err) {
            console.error('Error in updating song'); // TODO: Test this by pre-populating song
          } else {
            console.log('Successfully updated song', song.trackId);
            mongoose.disconnect();
          }
        });
      }
    }
  });
}

function _updateUser(tracks, userId, token) {
  console.log('in updateUser');
  User.findOne({ spotifyId: userId }, function(err, user, count) {
    if (user === null) { // mongo uses null
      var newUser = new User({
          spotifyId: userId,
          token: token,
          tracks: tracks
      });

      newUser.save(function(err, user, count) {
        if (err) {
          console.log('Error in saving newUser', err);
        } else {
          console.log('Successfully saved newUser!\n', user.spotifyId);
          mongoose.disconnect();
        }
      }, function(err) {
        console.error("Promise getTracks failed", err);
      });
    } else { // else update user's token
      user.token = token;
      user.tracks = tracks;

      // console.log('found old user');
      user.save(function(err, modifiedUser, count) {
        if (err) {
          console.log('Error in updating incoming user!\n', err);
        } else {
          console.log('Successfully updated incoming user', modifiedUser.spotifyId);
          mongoose.disconnect();
        }
      });
    }
  });
}

function _getTracks(userId, token) {
  return new Promise(function(resolve, reject) {
    var options = {
      url: 'https://api.spotify.com/v1/me/top/tracks',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    };

    request(options, function(err, res, body) {
      if (err) {
        reject(Error(err));
      } else {
        var info = JSON.parse(body);
        var items = info.items;
        var tracksArr = [];

        _genTracksObj(1, 11, items, tracksArr).then(function(response) {
          // console.log('genTracksObj resolved');
          resolve(response);
        }, function(err) {
          console.error('genTracksObj gave err', err);
        });
      }
    });
  });
}

function _genTracksObj(start, end, items, tracksArr) {
  return new Promise(function(resolve, reject) {
    if (start === end) {
      // console.log('Finished finding tracks');
      resolve(tracksArr);
    } else {
      // console.log('Currently retrieving genre');
      var artistIds = _getArtistIds(items[start].artists);

      _getGenres(artistIds).then(function(response) {

        var tracksObj = {
          trackId: items[start].id,
          artistIds: artistIds,
          genres: response,
          trackName: items[start].name
        };

        tracksArr.push(tracksObj);
        resolve(_genTracksObj(++start, end, items, tracksArr));
      }, function(err) {
        reject('Err in getTracksObj', err);
      });
    }
  });
}

function _getArtistIds(artists) {
  var ids = [];

  artists.forEach(function(artist) {
    ids.push(artist.id);
  });

  return ids;
}

function _getGenres(artistIds) {
  return new Promise(function(resolve, reject) {
    var genres = [];

    artistIds.forEach(function(artistId) {
      _reqGetGenres(artistId, genres).then(function(response) {
        response.forEach(function(genre) {
          if (!genres.includes(genre)) {
            genres.push(genre);
          }
        });
        resolve(genres);
      }, function(err) {
        reject(Error(err));
      });
    });
  });
}

function _reqGetGenres(artistId) {
  return new Promise(function(resolve, reject) {
    request({
        url: 'https://api.spotify.com/v1/artists/' + artistId
    }, function(err, res, body) {
      if (err) {
        reject(Error('Retrieval Error'));
      } else {
        resolve(JSON.parse(body).genres);
      }
    });
  });
}

module.exports = {
  updateDb: updateDb
};
