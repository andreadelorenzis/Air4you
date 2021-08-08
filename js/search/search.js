import { getCurrentAirQuality } from "../current/getCurrentData";
import { showCurrentComponent } from "../current/showCurrentData";
import { getCoordinates } from "../coordinates/getCoordinates";
import { getHistoricAirQuality } from "../history/getHistoricData.js";
import { getPollutionNews } from "../news/getNews.js";
import { getMapData } from "../map/map.js";
import { countFetched } from "..";

/* get predictions based on user input from Places API and show them in HTML */
let showPredictions = (value) => {

    /* local variables */
    const searchInput = document.querySelector(".search__input");
    const searchImg = document.querySelector(".search__img");
    const searchList = document.querySelector(".search__predictions");
    let count = 0;

    const displaySuggestions = function (predictions, status) {

        /* reset the predictions list */
        searchList.innerHTML = "";

        if (status != google.maps.places.PlacesServiceStatus.OK || !predictions) {
            searchList.innerHTML = "";
            return;
        }

        /* create the predictions items */
        predictions.forEach((element, i) => {

            /* create the prediction object */
            const prediction = {};
            prediction.description = element.description;
            prediction.place_id = element.place_id;
            prediction.city = element.terms[0].value;

            /* create the li element */
            const li = document.createElement("li");
            li.appendChild(document.createTextNode(prediction.description));
            li.classList.add("search__prediction");
            li.setAttribute("data-number", i);
            li.setAttribute("data-id", prediction.place_id);
            li.setAttribute("data-city", prediction.city);
            searchList.appendChild(li);

            /* highlight the first li element */
            if (i == 0) {
                li.style.backgroundColor = "#F6F6F6";
                li.classList.add("prediction--selected");
            }

            /* when an li element is clicked search data using the selected prediction */
            li.addEventListener('click', () => {

                /* reset input and close predictions */
                searchInput.value = '';
                searchList.classList.remove('search__predictions--activated');
                searchInput.classList.remove("search__input--activated");
                searchImg.classList.remove("search__input--activated");

                /* display loader and get data */
                displayLoader();
                getCurrentAirQuality(prediction);
                getCoordinates(prediction);

            });

            /* process down or up key arrows and enter key */
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

                    /* create prediction object */
                    let prediction = {}
                    prediction.description = document.querySelector(".prediction--selected").innerHTML;
                    prediction.place_id = document.querySelector(".prediction--selected").getAttribute("data-id");
                    prediction.city = document.querySelector(".prediction--selected").getAttribute("data-city");

                    /* reset input and close predictions list */
                    searchInput.value = "";
                    searchList.classList.remove('search__predictions--activated');
                    searchInput.classList.remove("search__input--activated");
                    searchImg.classList.remove("search__input--activated");

                    /* display loader and get data */
                    displayLoader();
                    getCurrentAirQuality(prediction);
                    getCoordinates(prediction);
                }
            });
        });

        /* close predictions when input loses focus */
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                searchList.classList.remove('search__predictions--activated');
            }, 100);
        });

    };

    /* show predictions if input is not empty */
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

/* get user latitude and longitude coordinates using Javascript Geolocation API */
function showPosition() {
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    displayLoader();

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

/* show error message */
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

/* hide sections and show loader instead */
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