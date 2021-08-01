import { showCurrentComponent } from "./showCurrentData"

/* get current air quality data from city name */
function getCurrentAirQuality(prediction, id = 0) {

    let city = "";
    if (typeof prediction == "string")
        city = prediction;
    else
        city = prediction.city;

    fetch(`https://api.waqi.info/feed/${id ? "@" + id : city}/?token=${process.env.AQICN_KEY}`)
        .then(response => {
            if (response.status >= 200 && response.status <= 299)
                return response.json()
            else
                throw Error(response.statusText);
        })
        .then(data => {
            if (data.status == "error" || data.data.aqi != "-")
                showCurrentComponent(data.data, prediction, false);
            else
                throw Error("aqi not available");
        })
        .catch(error => {
            console.log(error)

            /* if WAQI API fails, get lat and lng coordinates with Geocoding API */
            fetch(`https://maps.googleapis.com/maps/api/geocode/json?place_id=${prediction.place_id}&key=${process.env.GOOGLE_KEY}`)
                .then(response => {
                    if (response.status >= 200 && response.status <= 299)
                        return response.json()
                    else
                        throw Error(response.statusText);
                })
                .then(data => {
                    const lat = data.results[0].geometry.location.lat;
                    const lng = data.results[0].geometry.location.lng;

                    /* and get air quality data from lat and lng coordinates using Openweather API */
                    fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${process.env.OPENWEATHER_KEY}`)
                        .then(response => {
                            if (response.status >= 200 && response.status <= 299)
                                return response.json()
                            else
                                throw Error(response.statusText);
                        })
                        .then(data => {
                            showCurrentComponent(data.list[0], prediction, true);
                        })
                        .catch(error => {
                            console.log(error);
                            displayError();
                        });
                })
                .catch(error => {
                    console.log(error);
                    displayError();
                });
        });
}

function displayError() {
    const currentSection = document.querySelector(".current");
    currentSection.innerHTML = "";
    const div = document.createElement("div");
    div.classList.add("error__message");
    const content = `
        <h3>Current Air Quality</h3>
        <h1>No data available</h1>`;
    div.innerHTML = content;
    currentSection.appendChild(div);
}

export { getCurrentAirQuality };