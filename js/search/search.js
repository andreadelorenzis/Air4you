import { getCurrentAirQuality } from "../currentData/getCurrentData.js";
import { getCoordinates } from "../coordinates/getCoordinates.js";

/* get predictions based on user input from Places API and show them in HTML */
let showPredictions = (value) => {

    const searchInput = document.querySelector(".search__input");
    const searchImg = document.querySelector(".search__img");
    const searchList = document.querySelector(".search__predictions");
    searchList.innerHTML = "";

    const displaySuggestions = function (predictions, status) {
        if (status != google.maps.places.PlacesServiceStatus.OK || !predictions) {
            alert(status);
            return;
        }
        predictions.forEach((prediction) => {
            const li = document.createElement("li");
            li.appendChild(document.createTextNode(prediction.description));
            searchList.appendChild(li);
            li.addEventListener('click', () => {
                searchInput.value = '';
                searchList.classList.remove('search__predictions--activated');
                getCurrentAirQuality(prediction);
                getCoordinates(prediction);
            });
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

export { showPredictions };