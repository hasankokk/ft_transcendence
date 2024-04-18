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
      const twoFactorType = document.getElementById('twoFactorType').value;

    // Eğer 2FA devre dışı bırakılıyorsa, DELETE isteği gönder
    if (twoFactorType === "0") {
        fetchWithJWT('/user/remove-two-factor/', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error updating 2FA settings.');
        });
    } else {
        // Eğer 2FA etkinleştiriliyorsa, PUT isteği gönder
        fetchWithJWT(`/user/add-two-factor/${twoFactorType}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && twoFactorType === "3") {
                alert(`2FA set successfully. Use this TOTP secret for setup: ${data.secret}`);
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error updating 2FA settings.');
        });
    }
}

function bindLogout(anchorInstance) {
  // Logout is supposed to work in the exactly opposite way
  // The content should be requested after logout is complete

  sessionStorage.clear();

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
  window.gameTestInit();
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

document.getElementById("passwordForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Formun varsayılan submit işlemini engelle

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
    .then(response => response.json()) // Yanıtı JSON olarak ayrıştır
    .then(data => {
        if (data.success) {
            alert("Password changed successfully!");
        } else {
            // Sunucudan dönen hata mesajlarını göster
            alert("Failed to change password: " + data.errors.join(", "));
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred while changing the password.");
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
            loadContent("/home/"); // Redirect to home page after deletion
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
  window.gameTestInit();
}

function bindPongLocal() {
  window.lGameTestInit();
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

      if (!requestUrl.startsWith("/game/")) {
        if (!requestUrl.startsWith("/chat/")) {
          closeSocket(pongSocket);
        }
        onGamePage = false;
      } else {
        onGamePage = true;
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

function sendFriendRequest() {
    const username = document.getElementById('targetUsername').innerText;
    const data = JSON.stringify({
        receiver: username
    });

    fetchWithJWT("/user/friend-request/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: data
    })
    .then(response => response.json())
    .then(data => {
        alert(data.success || data.error);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function blockUser() {
    const username = document.getElementById('targetUsername').innerText;

    const data = JSON.stringify({
        receiver: username,
        action: 'block' // Assume the API can handle a block action, if not, you need to adjust backend logic
    });

    fetchWithJWT("/user/friend-request/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: data
    })
    .then(response => response.json())
    .then(data => {
        alert(data.success || data.error);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
