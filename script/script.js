const queryString = window.location.search;
const searchParams = new URLSearchParams(queryString);
const clientId = searchParams.get('client_id');
const code = searchParams.get('code');
const state = searchParams.get('state');
const error = searchParams.get('error');
const port = state;

window.onload = function () {
    if (searchParams.size === 0) {
        showDiv('error');
    } else {
        if (state) {
            // try authentication via localhost
            showDiv('in-progress');
            authenticateViaLocalhost();
        } else {
            // fallback to custom URI in case of failure
            showDiv('not-started');
        }
    }
}

function showDiv(name) {
    const divs = document.querySelectorAll('.hidden');
    divs.forEach(div => {
        if (div.id === name) {
            div.style.display = 'grid';
        } else {
            div.style.display = 'none';
        }
    });
}

function updateStatusImg(name) {
    const img = document.getElementById('status');
    img.src = `img/img_${name}.svg`;
}

function sendCodeToRose() {
    const magnetUri = `rose://relativitycodeflow/?client_id=${clientId}&code=${code ?? ''}&error=${error ?? ''}`;
    var iframe = document.querySelector('#hiddenIframe');
    iframe.contentWindow.location.href = magnetUri;
}

function authenticateViaLocalhost() {
    try {
        console.log(code);
        localHttpRequest("GET", `authenticate?client_id=${clientId}&code=${code ?? ''}&error=${error ?? ''}`)
            .then(response => {
                console.log("auth result", response);

                if (response.authenticated) {
                    showDiv('success');
                } else {
                    showDiv('error');
                }
            })
            .catch(error => {
                console.error(error);
                showDiv('not-started');
            });
    } catch (error) {
        console.error(error);
        showDiv('not-started');
    }
}

function localHttpRequest(requestType, endpoint, data = null, timeoutInMilliseconds = 10000) {
    var endpointUrl = new URL(endpoint, `http://localhost:${port}`).href;
    return fetch(
        endpointUrl,
        {
            method: requestType,
            body: data
        },
        { signal: AbortSignal.timeout(timeoutInMilliseconds) }
    ).then(response => response.json());
}