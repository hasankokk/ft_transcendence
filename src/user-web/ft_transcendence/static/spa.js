function handleTab(anchorInstance) {
    const requestUrl = anchorInstance.getAttribute("href")
    fetch(requestUrl)
    .then(response => response.text())
    .then(text => {
        element = document.getElementById("main-content");
        element.innerHTML = text;
        history.pushState({}, "", requestUrl);
    })

    return false;
}

const items = document.getElementsByClassName("nav-item");

for(i = 0; i < items.length; i++) {
    const anchor = items[i].querySelector("a");
    anchor.addEventListener('click', e => {
        e.preventDefault();
        handleTab(e.currentTarget);
    });
}