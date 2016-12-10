function main() {
  var genresArray = getGenreArray();
  var circlesArr = generateCircles(genresArray);
  // console.log(circlesArr);

  populatePageSvg(circlesArr);
  populatePageCircle(circlesArr);
  populatePageText(circlesArr);
  populateCircles(genresArray);

  setGenreListener();
}

function Genre(genre, count) {
  this.genre = genre;
  this.count = count;
}

function Text(fontSize, fontFamily, text, fill) {
  this.fontSize = fontSize;
  this.fontFamily = fontFamily;
  this.text = text;
  this.color = fill;
}

function Circle(cx, cy, r, text) {
  this.x = cx;
  this.y = cy;
  this.r = r;
  this.text = text;
}

function populatePageSvg(circlesArr) {
  circlesArr.forEach(function(circle) {
    var svgDiv = document.getElementById(circle.text.text);
    var genresSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    genresSvg.id = circle.text.text;

    svgDiv.appendChild(genresSvg);
    svgDiv.removeAttribute('id');
  });
}

function setGenreListener() {
  var circles = document.getElementsByTagName('circle');

  for (var i = 0; i < circles.length; ++i) {
    circles[i].addEventListener('click', getGenre);
  }
}

function fadeOutCircles() {
  console.log('fadingout');
  var genres = document.getElementById('genres');
  genres.classList.add('bounceOutRight');
}

function getGenre(event) {
  fadeOutCircles();
  window.setTimeout(function() {
    document.getElementById('genres').style.display = 'none';
    addLoadingBar();
  }, 500);

  getRequest(event)
    .then(function(trackIds) {
      return createGenrePage(trackIds);
    }, function(err) {
      console.log(err);
    })
    .then(function(iframeDiv) {
      var title = document.getElementById('title');
      console.log(iframeDiv);
      iframeDiv.style.display = 'none';

      title.classList.add('fadeInDown');
      title.innerHTML = event.target.id.replace(/-/g, ' ').toUpperCase();

      document.getElementById('body').appendChild(iframeDiv);

      window.setTimeout(function() {
        document.getElementById('back').style.display = 'block';
        hideLoadingBar();
        showIframes(iframeDiv);
      }, 3000);
    });
}

function showIframes(iframeDiv) {
  iframeDiv.classList.add('animated');
  iframeDiv.classList.add('rotateInUpLeft');
  iframeDiv.style.display = 'block';
}

function getRequest(event) {
  return new Promise(function(resolve, reject) {
    var url = '/api/genre?genre=' + encodeURIComponent(event.target.id);

    console.log('url', url);

    request(url, function(err, res, body) {
      if (err) {
        reject('Failed to get /genre');
      }

      if (res.status === 200) {
        resolve(JSON.parse(body));
      }
    });
  });
}

function createGenrePage(trackIds) {
  console.log('in createGenrePage');
  var iframeDiv = createIframeDiv();
  // document.getElementById('body').appendChild(iframeDiv);

  trackIds.forEach(function(trackId) {
    // var iframePlayer = createIframePlayer(trackId);
    // iframePlayer.className += 'player';

    iframeDiv.appendChild(createIframePlayer(trackId));
  });

  console.log('iframe div', iframeDiv);

  return iframeDiv;
}

function hideLoadingBar() {
  var spinner = document.getElementById('spinner');
  spinner.style.display = 'none';
}

function addLoadingBar() {
  var spinner = document.getElementById('spinner');
  spinner.style.display = 'block';
}

function createIframeDiv() {
  var div = document.createElement('div');
  div.id = 'players';

  return div;
}

function createIframePlayer(trackId) {
  var iframe = document.createElement('IFRAME');
  iframe.src = 'https://embed.spotify.com/?uri=spotify:track:' + trackId;
  iframe.width = '300';
  iframe.height = '380';
  iframe.setAttribute('allowtransparency', 'true');
  iframe.className += 'player';

  return iframe;
}

function getGenreArray() {
  var genreText = document.getElementsByClassName('genre-text');
  var genreArr = [];

  for (var i = 0; i < genreText.length; ++i) {
    var genreType = genreText[i].id;
    var classArr = genreText[i].className.split(" ");
    var count = parseInt(classArr[0], 10);
    var genre = new Genre(genreType, count);

    genreArr.push(genre);
  }

  return genreArr;
}

function generateCircles(arr) {
  var x = 0;
  var y = 20;
  var circleArr = [];

  arr.forEach(function(genre) {
    var random = Math.floor(Math.random() * 3 + 20);

    if (x >= 120) {
      y += 200;
      x = 0;
    }

    var circle = new Circle((x += (40 + random)), y, (150 + (2 * genre.count)), new Text('24', 'Droid Sans Mono', genre.genre, 'white'));
    circleArr.push(circle);
  });

  return circleArr;
}

function populatePageCircle(circleArr) {

  circleArr.forEach(function(circle) {
    var genresSvg = document.getElementById(circle.text.text);
    var pageCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pageCircle.setAttribute('cx', circle.x);
    pageCircle.setAttribute('cy', circle.y);
    pageCircle.setAttribute('r', circle.r);
    pageCircle.id = circle.text.text;

    pageCircle.classList.add('genre');
    pageCircle.classList.add('animated');
    pageCircle.classList.add('wobble');
    pageCircle.classList.add('bounceInLeft');


    genresSvg.appendChild(pageCircle);
  });
}

function populatePageText(circlesArr) {
  circlesArr.forEach(function(circle) {
    var genreSvg = document.getElementById(circle.text.text);
    var genreText = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    genreText.setAttributeNS(null, 'x', circle.x);
    genreText.setAttributeNS(null, 'y', circle.y);
    genreText.setAttributeNS(null, 'font-size', circle.text.fontSize);
    genreText.setAttributeNS(null, 'font-family', circle.text.fontFamily);
    genreText.setAttributeNS(null, 'text-anchor', 'middle');
    genreText.setAttributeNS(null, 'fill', circle.text.color);
    genreText.innerHTML = circle.text.text;

    genreText.classList.add('genre');
    genreText.classList.add('animated');
    genreText.classList.add('bounceInLeft');
    genreText.classList.add('shake');

    genreSvg.appendChild(genreText);
  });
}

function populateCircles() {
  var colorArr = ['00D0BF', 'B151FA', 'FF8686'];
  var circlesArr = d3.selectAll('circle')._groups[0];

  circlesArr.forEach(function(circle) {
    var ind = Math.floor(Math.random() * 3);
    circle.style.fill = colorArr[ind];
  });
}

main();
