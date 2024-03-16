function submitForm(formInstance) {

    const form = formInstance
    const formData = new FormData(form);
	responseUrl = ''

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
            return response.json();
            return false
        }
    })
    .then(data => {
        console.log(data);
        return false;
    }) // TODO: Set cookies instead and redirect
    .catch(error => {
        console.error(error.message);
        return false;
    });

    console.log("fetch promise chain complete") // DEBUG

    return true;
}
