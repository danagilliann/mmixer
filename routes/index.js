var express = require('express');
var router = express.Router();
var config = require('config.json')('./config.json');
var client_id = config.client_id;
var client_secret = config.client_secret;
var querystring = require('querystring');
var request = require('request');
var uuid = require('uuid');
var stateKey = 'spotify_auth_state';
var redirect_uri = config.redirect_uri;

var mongoose = require('mongoose');
var Songs = mongoose.model('Songs');
var Genres = mongoose.model('Genres');

var indexCtrl = require('../controllers/index');
var genresCtrl = require('../controllers/genres');

if (process.env.NODE_ENV == 'PRODUCTION') {
  redirect_uri = config.prod_redirect_uri;
}

/* GET home page. */
// TODO: Do something for validating already logged-in users => Cookies?
router.get('/', function(req, res, next) {
  res.render('index', {});
});

router.get('/genres', function(req, res, next) {
  console.log('in /genres');
  genresCtrl.getGenres().then(function(genres) {
    console.log('finished getting genres');
    // var dashedGenres = [];
    // genres.forEach(function(genre) {
    //   dashedGenres.push(genre.replace(/\s+/g, '-'));
    // });
    console.log(genres);

    res.render('genres', { genres: genres }); // TODO: Include non-dashed genres
  }, function(err) {
    console.error(err);
  });
});

router.get('/api/genre', function(req, res, next) {
  var genre = req.query.genre.replace(/%26/, '&');
  genre = req.query.genre.replace(/-/g, ' ');

  console.log('attempting to find', genre);
// Songs.find({}, (err, songs) => {
//   console.log(songs);
// });
// 
// console.log('please');

  // genresCtrl.getGenre();
  Songs.find({
    genres: genre
  }, function(err, songs, count) {
    console.log('count', count);
    console.log('songs', songs);

    res.json(songs.map(function(song) {
      console.log('hello ', song);
      return song.trackId;
    }));
  });
});

router.get('/login', function(req, res, next) {
  var state = uuid.v1();
  res.cookie(stateKey, state);

  var scope = 'user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

router.get('/callback', function(req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    console.log('state === null || state !== storedState');

    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    console.log('success');
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log('success post request');

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // access to user info
        var requestPromise = new Promise(function(resolve, reject) {
          request.get(options, function(error, response, body) {
            console.log('in req');
            if (error) { reject(error) };

            indexCtrl.updateDb(body.id, access_token)
              .then(function(response) {
                resolve(response);
              });
          });
        });

        requestPromise.then(function(result) {
          console.log('result of requestPromise', result);
          res.redirect('/genres');
        }, function(err) {
          console.error('Failed to update db');
        });

        // we can also pass the token to the browser to make requests from there
        // res.redirect('/genres');
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

module.exports = router;
