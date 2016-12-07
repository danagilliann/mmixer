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
    circles[i].addEventListener('click', getRequest);
  }
}

function getRequest(event) {
  var url = '/genre?genre=' + event.target.id;
  console.log(event.target.id);

  http.get({
    url: url,
    onload: function() {
      var trackIds = JSON.parse(this.responseText);

      createGenrePage(trackIds);
    },
    onerror: function() {
      console.log('Failed to get /genre');
    }
  });
}

function createGenrePage(trackIds) {
  document.getElementById('genres').style.display = 'none';
  var iframeDiv = createIframeDiv();
  document.getElementById('body').appendChild(iframeDiv);

  trackIds.forEach(function(trackId) {
    var iframePlayer = createIframePlayer(trackId);
    iframePlayer.className += 'player';

    iframeDiv.appendChild(createIframePlayer(trackId));
  });
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
