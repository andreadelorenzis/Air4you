import { showNewsComponent } from "./showNews";
import { countries } from "../countries";

/* get news about pollution in the country of the selected city */
function getPollutionNews(lat, lng) {

    /* get country of selected prediction from lat and lng*/
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_KEY}&language=en&result_type=country`)
        .then(response => response.json())
        .then(data => {
            const country = data.results[0].formatted_address;

            /* get country code */
            let countryCode = '';
            Object.keys(countries).forEach(item => {
                if (country == item)
                    countryCode = countries[country];
            });

            /* fetch news */
            fetch(`https://api.currentsapi.services/v1/search?language=en&category=environment&country=int&keywords=${country}&limit=6&apiKey=${process.env.NEWS_KEY}`)
                .then(response => response.json())
                .then(data => showNewsComponent(data, country));

        });
}

export { getPollutionNews };