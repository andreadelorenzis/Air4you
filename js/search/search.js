import { getCurrentAirQuality } from "../currentData/getCurrentData";
import { showCurrentComponent } from "../currentData/showCurrentData";
import { getCoordinates } from "../coordinates/getCoordinates";
import { getHistoricAirQuality } from "../historicData/getHistoricData.js";
import { getPollutionNews } from "../news/getNews.js";
import { getMapData } from "../map/map.js";
import { countFetched } from "..";

/* get predictions based on user input from Places API and show them in HTML */
let showPredictions = (value) => {

    const searchInput = document.querySelector(".search__input");
    const searchImg = document.querySelector(".search__img");
    const searchList = document.querySelector(".search__predictions");

    const displaySuggestions = function (predictions, status) {
        searchList.innerHTML = "";
        if (status != google.maps.places.PlacesServiceStatus.OK || !predictions) {
            searchList.innerHTML = "";
            return;
        }
        predictions.forEach((element, i) => {
            const prediction = {};
            prediction.description = element.description;
            prediction.place_id = element.place_id;
            prediction.city = element.terms[0].value;

            const li = document.createElement("li");
            li.appendChild(document.createTextNode(prediction.description));
            li.classList.add("search__prediction");
            li.setAttribute("data-number", i);
            li.setAttribute("data-id", prediction.place_id);
            li.setAttribute("data-city", prediction.city);
            searchList.appendChild(li);

            if (i == 0) {
                li.style.backgroundColor = "#F6F6F6";
                li.classList.add("prediction--selected");
            }

            /* list element clicked */
            li.addEventListener('click', () => {
                console.log("clicked")
                searchInput.value = '';
                searchList.classList.remove('search__predictions--activated');
                searchInput.classList.remove("search__input--activated");
                searchImg.classList.remove("search__input--activated");

                displayLoader();
                getCurrentAirQuality(prediction);
                getCoordinates(prediction);
            });

            /* arrow down/up or enter button pressed */
            let count = 0;
            searchInput.addEventListener('keydown', (e) => {
                event.stopImmediatePropagation();

                /* select element with arrow keys */
                if (e.code == "ArrowDown" && count < predictions.length - 1) {
                    count++;
                } else if (e.code == "ArrowUp" && count > 0) {
                    count--;
                }
                document.querySelectorAll(".search__prediction").forEach(prediction => {
                    if (prediction.getAttribute("data-number") == count) {
                        prediction.style.backgroundColor = "#F6F6F6";
                        prediction.classList.add("prediction--selected");
                    } else {
                        prediction.style.backgroundColor = "#ffffff";
                        prediction.classList.remove("prediction--selected");
                    }
                });

                /* search data if enter key is pressed */
                if (e.code == "Enter") {
                    e.preventDefault();
                    let prediction = {}
                    prediction.description = document.querySelector(".prediction--selected").innerHTML;
                    prediction.place_id = document.querySelector(".prediction--selected").getAttribute("data-id");
                    prediction.city = document.querySelector(".prediction--selected").getAttribute("data-city");
                    searchInput.value = "";
                    searchList.classList.remove('search__predictions--activated');
                    searchInput.classList.remove("search__input--activated");
                    searchImg.classList.remove("search__input--activated");

                    displayLoader();
                    getCurrentAirQuality(prediction);
                    getCoordinates(prediction);
                }
            });
        });

        /* input loses focus */
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                searchList.classList.remove('search__predictions--activated');
            }, 100);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.code == "Enter")
                e.preventDefault();
        });
    };

    if (value != "") {
        const service = new google.maps.places.AutocompleteService();
        const request = { input: value, types: ['(cities)'] }
        service.getPlacePredictions(request, displaySuggestions);
        searchList.classList.add("search__predictions--activated");
        searchInput.classList.add("search__input--activated");
        searchImg.classList.add("search__input--activated");
    } else {
        searchList.classList.remove("search__predictions--activated");
        searchInput.classList.remove("search__input--activated");
        searchImg.classList.remove("search__input--activated");
    }

}

/* get user lat and lon coordinates using Javascript Geolocation API */
function showPosition() {

    displayLoader();

    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    function success(pos) {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        /* fetch the WAQI API using lat and lon */
        fetch(`https://api.waqi.info/feed/geo:${lat};${lng}/?token=${process.env.AQICN_KEY}`)
            .then(response => {
                if (response.status >= 200 && response.status <= 299)
                    return response.json()
                else
                    throw Error(response.statusText);
            })
            .then(data => {
                let city = data.data.city.name;
                showCurrentComponent(data.data, city, false);
                getMapData(lat, lng, city);
            })
            .catch(error => {
                console.log(error);
                displayError();
            })
            .finally(() => {
                countFetched();
            });

        /* get other data using lat and lng */
        getHistoricAirQuality(lat, lng);
        getPollutionNews(lat, lng);
    }

    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.getCurrentPosition(success, error, options);
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

/* hide sections and show loader */
function displayLoader() {
    document.querySelector(".city-name").style.display = "none";
    document.querySelector(".city-name-subtitle").style.display = "none";
    document.querySelector(".loader").classList.remove("hide");
    document.querySelector(".loader-right").classList.remove("hide");
    document.querySelector(".loader-left").classList.remove("hide");
    document.querySelector(".current").style.display = "none";
    document.querySelector(".history").style.display = "none";
    document.querySelector(".news").style.display = "none";
    document.querySelector('.map').style.visibilty = "hidden";
    document.querySelector('.map').style.position = "absolute";
}

export { showPredictions, showPosition };