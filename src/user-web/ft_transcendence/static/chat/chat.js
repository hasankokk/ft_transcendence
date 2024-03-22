function chatFunction() {

  const chatFrame = document.getElementById("chat-frame");

  // Sayfanın altına kaydırma
  chatFrame.querySelector(".messages").scrollTo({
    top: chatFrame.body.scrollHeight,
    behavior: "smooth",
  });

  // Profil resmine tıklama
  chatFrame.getElementById("profile-img").addEventListener("click", function () {
    chatFrame.getElementById("status-options").classList.toggle("active");
  });

  // Genişlet butonuna tıklama
  chatFrame.querySelectorAll(".expand-button").forEach((button) => {
    button.addEventListener("click", function () {
      chatFrame.getElementById("profile").classList.toggle("expanded");
      chatFrame.getElementById("contacts").classList.toggle("expanded");
    });
  });

  // Durum seçeneklerine tıklama
  chatFrame.querySelectorAll("#status-options ul li").forEach((item) => {
    item.addEventListener("click", function () {
      chatFrame.getElementById("profile-img").className = "";
      chatFrame.querySelectorAll("#status-options ul li").forEach((status) => {
        status.classList.remove("active");
      });
      this.classList.add("active");

      if (
        chatFrame.getElementById("status-online").classList.contains("active")
      ) {
        chatFrame.getElementById("profile-img").classList.add("online");
      } else if (
        chatFrame.getElementById("status-away").classList.contains("active")
      ) {
        chatFrame.getElementById("profile-img").classList.add("away");
      } else if (
        chatFrame.getElementById("status-busy").classList.contains("active")
      ) {
        chatFrame.getElementById("profile-img").classList.add("busy");
      } else if (
        chatFrame.getElementById("status-offline").classList.contains("active")
      ) {
        chatFrame.getElementById("profile-img").classList.add("offline");
      } else {
        chatFrame.getElementById("profile-img").className = "";
      }

      chatFrame.getElementById("status-options").classList.remove("active");
    });
  });

  // Yeni mesaj gönderme
  function newMessage() {
    let message = chatFrame.querySelector(".message-input input").value;
    if (!message.trim()) {
      return false;
    }
    let newMessageElement = chatFrame.createElement("li");
    newMessageElement.className = "sent";
    newMessageElement.innerHTML = `<img src="https://static.vecteezy.com/system/resources/previews/020/765/399/large_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg" alt="" /><p>${message}</p>`;
    chatFrame.querySelector(".messages ul").appendChild(newMessageElement);

    chatFrame.querySelector(".message-input input").value = "";
    chatFrame.querySelector(
      ".contact.active .preview"
    ).innerHTML = `<span>You: </span>${message}`;
    chatFrame.querySelector(".messages").scrollTo({
      top: chatFrame.body.scrollHeight,
      behavior: "smooth",
    });
  }

  // Mesaj gönder butonuna tıklama
  chatFrame.querySelector(".submit").addEventListener("click", function () {
    newMessage();
  });

  // Enter tuşu ile mesaj gönderme
  window.addEventListener("keydown", function (e) {
    if (e.which == 13 || e.keyCode == 13) {
      newMessage();
      return false;
    }
  });
}