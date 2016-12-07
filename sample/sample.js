var request = require('request');

request({ url: 'https://api.spotify.com/v1/artists/0C0XlULifJtAgn6ZNCW2eu' }, (err, res, body) => {
  if (err) {
    console.log(err);
  } else {
    var data = JSON.parse(body);
    console.log(data.genres);
  }
});
