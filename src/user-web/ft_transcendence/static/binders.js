function bindLogin() {
  //addEventListener on #loginButton for submitForm()
  //addEventListener on .oauth-button for 42Login

  document
    .getElementById("loginSubmitButton")
    .addEventListener("click", (e) => {
      e.preventDefault();
      submitForm(e.currentTarget.form, bindTwoFactor);
    });

  console.log("called bindLogin()"); // DEBUG, Should be called when login page appears

  const a_register = document.getElementById("registerLink");
  bindAnchor(a_register, bindRegister);

  const a_42login = document.getElementById("42LoginLink");
  a_42login.addEventListener("click", (e) => {
    e.preventDefault();
    fetchOAuthUrl();
  });
}

function bindRegister() {
  console.log("called bindRegister()"); // DEBUG, Should be called when register page appears

  document
    .getElementById("registerSubmitButton")
    .addEventListener("click", (e) => {
      e.preventDefault();
      submitForm(e.currentTarget.form, bindLogin);
    });

  const a_login = document.getElementById("loginLink");
  bindAnchor(a_login, bindLogin);
}

function bindTwoFactor() {
  document.getElementById("2FASubmitButton").addEventListener("click", (e) => {
    e.preventDefault();
    submitForm(e.currentTarget.form);
  });
}

function bindLogout(anchorInstance) {
  // Logout is supposed to work in the exactly opposite way
  // The content should be requested after logout is complete

  anchorInstance.addEventListener("click", (e) => {
    e.preventDefault();
    fetch(anchorInstance.href)
      .then((response) => response.json())
      .then((data) => {
        loadContent(data.redirect);
      });
  });
}

function bindHome() {}

function bindGame() {
  console.log("called bingGame");
  window.pong_start();
}

function bindRanking() {}

function bindProfile() {
  document
    .getElementById("profilePhotoForm")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Formun normal submit işlemi engellenir.

      const fileInput = document.getElementById("profilePhoto");
      if (fileInput.files.length === 0) {
        alert("Please select a file to upload.");
        return;
      }

      const formData = new FormData();
      formData.append("image", fileInput.files[0]); // 'image' yerine sunucu tarafında beklenen alan adını kullanın.

      fetchWithJWT("/user/get_image/", {
        // API endpoint'inizi doğru yolla güncelleyin.
        method: "PUT",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw response;
          }
          return response.json();
        })
        .then((data) => {
          if (data.success) {
            alert("Profile photo updated successfully!");
          } else {
            if (data.errors) {
              alert(
                "Failed to update profile photo: " + data.errors.join(", ")
              );
            } else {
              alert("Failed to update profile photo: Unknown error");
            }
          }
        })
        .catch((error) => {
          error
            .json()
            .then((errData) => {
              if (errData && errData.errors) {
                console.error(
                  "Error updating profile photo:",
                  errData.errors.join(", ")
                );
              } else {
                console.error(
                  "Error updating profile photo: Failed to parse error message"
                );
              }
            })
            .catch(() => {
              console.error(
                "Error updating profile photo: Network or parse error"
              );
            });
        });
    });

  document
    .getElementById("changePassword")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const oldPassword = document.getElementById("oldPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      fetchWithJWT("/user/change-password/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password1: newPassword,
          new_password2: confirmPassword,
        }),
      })
        .then((response) => {
          if (response.success) {
            alert("Password changed successfully!");
          } else {
            alert("Failed to change password: " + response.errors.join(", "));
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });

  document
    .getElementById("deleteProfile")
    .addEventListener("click", function () {
      if (
        confirm(
          "Are you sure you want to delete your profile? This action cannot be undone."
        )
      ) {
        fetchWithJWT("/user/delete-account/", {
          method: "DELETE",
        })
          .then(() => {
            window.location.href = "/home"; // Redirect to home page after deletion
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    });
}

function bindChat() {
  chatFunction();
}

function bindChatRoom() {
  chatRoom();
}

function bindPongRoom() {
  pongRoom();
  window.pong_start();
}

function bindAnchor(anchorInstance, func) {
  anchorInstance.removeEventListener("click", loadContentEvent);

  anchorInstance.addEventListener("click", (e) => {
    e.preventDefault();
    bindFunc = func;
    loadContent(e.currentTarget);
  });
}

function updateContentAnchors() {
  /*
    Set SPA switch for all anchors in element (#main-content)
    */

  const element = document.getElementById("main-content");
  const anchors = element.querySelectorAll("a");

  for (let i = 0; i < anchors.length; i++) {
    anchors[i].addEventListener("click", loadContentEvent);
  }
}

function loadContent(anchorInstanceOrPath, pushHistory = true) {
  let requestUrl;

  if (typeof anchorInstanceOrPath === "string") {
    requestUrl = anchorInstanceOrPath;
  } else {
    requestUrl = anchorInstanceOrPath.getAttribute("href");
  }

  fetchWithJWT(requestUrl)
    .then((response) => response.text())
    .then((text) => {
      const element = document.getElementById("main-content");

      if (pushHistory) {
        const state = getState(requestUrl, bindFunc);
        history.pushState(state, "", "");
      }
      element.innerHTML = text;

      if (requestUrl !== "/chat/pong") {
        closeSocket(pongSocket);
        onGamePage = true;
      } else {
        onGamePage = false;
      }
    });
  checkUserSession();
  return false;
}

function loadContentEvent(event) {
  event.preventDefault();
  loadContent(event.currentTarget);
}

function loadHistoryEvent(event) {
  const path = event.state.path;
  const binder_name = event.state.binder_name;
  const binder = binder_name !== null ? window[binder_name] : null;

  //console.log(path); // DEBUG
  //console.log(binder_name); // DEBUG
  //console.log(binder) // DEBUG

  bindFunc = binder;
  loadContent(path, false);
}

function getState(path, binder) {
  return {
    path: path,
    binder_name:
      binder !== null && typeof binder !== "undefined" ? binder.name : null,
  };
}

function closeSocket(socketInstance) {
  if (typeof socketInstance === "object") {
    if (socketInstance.readyState === WebSocket.OPEN) {
      socketInstance.close();
    }
  }
}
