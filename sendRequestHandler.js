function sendRequest(method, url, headerName="", headerValue="", requestBody="") {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        if (headerName !== "" && headerValue !== "") xhr.setRequestHeader(headerName, headerValue);
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.responseText);
            }
            else {
                reject(xhr.statusText);
            }
        };
        xhr.send(requestBody);
    });
}

window.sendRequest = sendRequest;