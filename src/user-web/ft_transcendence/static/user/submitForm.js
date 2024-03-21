function submitForm(formInstance) {
  const form = formInstance;
  const formData = new FormData(form);

  console.log("SubmitForm Called"); // DEBUG

  let postData = {};
  formData.forEach((value, key) => {
    postData[key] = value;
  });

  const requestUrl = form.getAttribute("action");

  console.log("Calling fetch..."); // DEBUG

  fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      loadContent(data.redirect);
    } else {
      const target = document.getElementById("form_error");
      for (const error of data.errors) { // fix : data.errors undefined
        msg = '<div role="alert" class="alert alert-error">';
        msg += error;
        msg += "</div>";
        target.appendChild(document.createTextNode(msg));
      }
    }
  });
}

function fetchOAuthUrl() {
  fetch("/user/get-oauth-url/")
    .then((response) => response.json())
    .then((data) => {
      const oauthWindow = window.open(
        data.oauth_url,
        "oauthWindow",
        "width=600,height=700"
      );

      const checkWindowClosed = setInterval(() => {
        if (oauthWindow.closed) {
          clearInterval(checkWindowClosed);
          // OAuth penceresi kapandıktan sonra oturum durumunu kontrol et ve UI'ı güncelle
          checkUserSession();
        }
      }, 1000);
    })
    .catch((error) => console.error("Error fetching OAuth URL:", error));
}