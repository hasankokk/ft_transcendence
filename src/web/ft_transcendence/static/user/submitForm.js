function submitForm(formInstance) {

    const form = formInstance
    const formData = new FormData(form);
    redirection = ''

    console.log("SubmitForm Called") // DEBUG

    postData = {}
    formData.forEach( (value, key) => {
        postData[key] = value;
    });

    const requestUrl = form.getAttribute("action")

    const headers = new Headers({
        'Content-Type': 'application/json'
    });

    console.log("Calling fetch...") // DEBUG

    fetch(requestUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(postData),
    })
    .then(response => {
        if (response.status === 401) {
            throw new Error("Incorrect username or password"); // DEBUG
        }
        else {
            redirection = response.url
            return response.json();
        }
    })
    .then(data => {
        console.log(data);
        window.location.href = window.location.href // Redirect to the same page
        return true;
    }) // TODO: Set cookies instead and redirect
    .catch(error => {
        console.error(error.message);
        window.location.href = window.location.href // Redirect to the same page
        return false;
    });

    console.log("fetch promise chain complete") // DEBUG

    return true;
}