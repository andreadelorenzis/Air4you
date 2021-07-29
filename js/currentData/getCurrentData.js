import { showCurrentComponent } from "./showCurrentData"

/* get current air quality data from city name */
function getCurrentAirQuality(prediction) {
    const city = prediction.terms[0].value;
    fetch(`https://api.waqi.info/feed/${city}/?token=${process.env.AQICN_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.status != 'error')
                showCurrentComponent(data.data, prediction, false);
            else
                /* if WAQI API fails, get lat and lng coordinates with Geocoding API */
                fetch(`https://maps.googleapis.com/maps/api/geocode/json?place_id=${prediction.place_id}&key=${process.env.GOOGLE_KEY}`)
                    .then(response => response.json())
                    .then(data => {
                        const lat = data.results[0].geometry.location.lat;
                        const lng = data.results[0].geometry.location.lng;

                        /* and get air quality data from lat and lng coordinates using Openweather API */
                        fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${process.env.OPENWEATHER_KEY}`)
                            .then(response => response.json())
                            .then(data => {
                                showCurrentComponent(data.list[0], prediction, true);
                            });

                    });
        });
}

export { getCurrentAirQuality };