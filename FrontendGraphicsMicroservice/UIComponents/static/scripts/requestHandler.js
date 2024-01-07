document.getElementById("registerLink").addEventListener("click", async function () {
    let response = await fetch("/register", {
        method: "GET",
        headers: {
            "Content-Type": "text/html"
        }
    });
    let data = await response.text();
    document.getElementById("loginCard").innerHTML = data;
});
