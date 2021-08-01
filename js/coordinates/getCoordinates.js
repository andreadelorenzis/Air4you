import { getHistoricAirQuality } from "../historicData/getHistoricData.js";
import { getPollutionNews } from "../news/getNews.js";
import { getMapData } from "../map/map.js";

/* get lat and lng coordinates with Geocoding API */
function getCoordinates(prediction) {
    let city = "";
    if (typeof prediction == "string")
        city = prediction;
    else
        city = prediction.city;

    fetch(`https://maps.googleapis.com/maps/api/geocode/json?place_id=${prediction.place_id}&key=${process.env.GOOGLE_KEY}`)
        .then(response => response.json())
        .then(data => {
            const lat = data.results[0].geometry.location.lat;
            const lng = data.results[0].geometry.location.lng;

            getHistoricAirQuality(lat, lng);
            getPollutionNews(lat, lng);
            getMapData(lat, lng, city);
        });
}

export { getCoordinates };