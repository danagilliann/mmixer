function main() {
  loginClick();
}

function loginClick() {
  var login = document.getElementById('login');
  var spinner = document.getElementById('spinner');

  login.addEventListener('click', function() {
    // console.log(login);
    login.classList.add('fadeOut');
    login.style.display = 'none';

    spinner.classList.add('fadeIn');
    spinner.style.display = 'block';
  });
}

main();
