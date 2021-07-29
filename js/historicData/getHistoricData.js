import { showHistoricComponent } from "./showHistoricData";

/* get historic air quality data from latitude and longitude */
function getHistoricAirQuality(lat, lng) {
    const date = new Date();
    date.getTime();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    const secondsPerDay = 86400;
    const endDate = Math.floor(date.getTime() / 1000);
    const startDate = endDate - (secondsPerDay * 8);

    fetch(`https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lng}&start=${startDate}&end=${endDate}&appid=${process.env.OPENWEATHER_KEY}`)
        .then(response => response.json())
        .then(data => {
            showHistoricComponent(data);
        });
}

export { getHistoricAirQuality };