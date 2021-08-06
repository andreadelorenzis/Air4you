import { showNewsComponent } from "./showNews";
import { countFetched } from "../index";
import { countries } from "../countries";

/* get news about pollution in the country of the selected city */
function getPollutionNews(lat, lng) {

    /* get country of selected prediction from lat and lng*/
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_KEY}&language=en&result_type=country`)
        .then(response => {
            if (response.status >= 200 && response.status <= 299)
                return response.json()
            else
                throw Error(response.statusText);
        })
        .then(data => {
            const country = data.results[0].formatted_address;
            console.log(country)
            /* get country code */
            let countryCode = '';
            Object.keys(countries).forEach(item => {
                if (country == item)
                    countryCode = countries[country];
            });
            /* fetch news */
            fetch(`https://api.currentsapi.services/v1/search?category=environment&country=${countryCode}&limit=6&apiKey=${process.env.NEWS_KEY}`)
                .then(response => {
                    if (response.status >= 200 && response.status <= 299)
                        return response.json()
                    else
                        throw Error(response.statusText);
                })
                .then(data => {
                    if (data.news.length == 0)
                        displayError();
                    else
                        showNewsComponent(data, country);
                })
                .catch(error => {
                    console.log(error);
                    displayError();
                })
                .finally(() => {
                    countFetched();
                });

        })
        .catch(error => {
            console.log(error);
            displayError();
        });
}

function displayError() {
    const newsSection = document.querySelector(".news");
    newsSection.innerHTML = "";
    const div = document.createElement("div");
    div.classList.add("error__message");
    const content = `
        <h3>Environment news</h3>
        <h1>No news found</h1>`;
    div.innerHTML = content;
    newsSection.appendChild(div);
}

export { getPollutionNews };