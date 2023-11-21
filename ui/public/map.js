window.map = L.map('map').setView([51.505, -0.09], 13);

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(window.map);
var storage = localStorage.email ? localStorage : (sessionStorage.email ? sessionStorage : { email: "", password: "", code: "" })
if (localStorage.email) {
    document.querySelector("#email").value = storage.email
    document.querySelector("#password").value = storage.password
    document.querySelector("#code").value = storage.code
}

function checkLocation() {
    if (!storage.time) return appendAlert("You'll need to sign in again, sorry about that.", "danger")
    fetch("/api/session?" + new URLSearchParams({
        cookie: storage.cookie,
        person: storage.person,
        name: storage.name,
        time: storage.time
    }), { method: "POST" }).then(res => res.json()).then(res => {
        if (res.message == "Authentication failed.") return appendAlert("Your session expired", "danger")
        else {
            if (!res.lat || !res.lon) return appendAlert("Your bus route is not running or your district turned off bus location visibility.", "info")
            if (window.busMarker) window.busMarker.remove()
            window.map.setView([res.lat, res.lon])
            window.busMarker = L.marker([res.lat, res.lon]).addTo(map);
        }

    })
}
window.login = function () {
    document.querySelector("#login").disabled = true
    const email = document.querySelector("#email").value
    const password = document.querySelector("#password").value
    const code = document.querySelector("#code").value

    if (!email || !password || !code) {
        appendAlert("Please make sure all of the fields are filled out.", "danger")
    }
    if (document.querySelector("#remember").checked) { }
    fetch("/api/login?" + new URLSearchParams({
        user: email,
        pass: password,
        code: code
    }), { method: "POST" }).then(res => res.json()).then(res => {
        if (res.error) return appendAlert(res.error, "danger")
        if (document.querySelector("#remember").checked) {
            localStorage.email = email
            localStorage.password = password
            localStorage.code = code
            localStorage.cookie = res.cookie
            localStorage.person = res.person
            localStorage.time = res.time
        } else {
            sessionStorage.email = email
            sessionStorage.password = password
            sessionStorage.code = code
            sessionStorage.cookie = res.cookie
            sessionStorage.person = res.person
            sessionStorage.time = res.time
        }
        if (!res.lat || !res.lon) return appendAlert("Your bus route is not running or your district turned off bus location visibility.", "info")

        if (window.busMarker) window.busMarker.remove()
        window.map.setView([res.lat, res.lon])
        window.busMarker = L.marker([res.lat, res.lon]).addTo(map);
        window.checkID = setInterval(checkLocation, 30000)
    })
    document.querySelector("#login").disabled = true
}
function logout() {
    sessionStorage.clear();
    localStorage.clear();
    appendAlert("Successfully logged out. This page will reload in 3 seconds.", "success")
    window.setTimeout(window.location.reload.bind(window.location), 3000);
}