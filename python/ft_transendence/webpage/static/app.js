document.addEventListener('DOMContentLoaded', function() {
  const registerLink = document.getElementById("registerLink");
  const loginLink = document.getElementById("loginLink");
  const registerCard = document.getElementById("registerCard");
  const loginCard = document.getElementById("loginCard");

  if (loginCard) {
      loginCard.style.display = "";
  }

  function toggleDisplay(card) {
    if (!card) {
        return; // Eğer card null ise, işlem yapmadan çık.
    }
    return card.style.display === 'none' ? '' : 'none';
}


  if (registerLink) {
      registerLink.addEventListener("click", function () {
          registerCard.style.display = toggleDisplay(registerCard);
          if (loginCard) {
              loginCard.style.display = 'none';
          }
      });
  }

  if (loginLink) {
      loginLink.addEventListener("click", function () {
          loginCard.style.display = toggleDisplay(loginCard);
          if (registerCard) {
              registerCard.style.display = 'none';
          }
      });
  }
});
