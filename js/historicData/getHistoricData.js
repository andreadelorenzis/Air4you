import { showHistoricComponent } from "./showHistoricData";
import { countFetched } from "../index";
import { calculateAQI, mapAQItoHealthData } from "../helpers/helpers";

/* get historic air quality data from latitude and longitude */
function getHistoricAirQuality(lat, lng) {

    /* local variables */
    const date = new Date();
    date.getTime();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    const secondsPerDay = 86400;
    const endDate = Math.floor(date.getTime() / 1000);
    const startDate = endDate - (secondsPerDay * 8);

    fetch(`https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lng}&start=${startDate}&end=${endDate}&appid=${process.env.OPENWEATHER_KEY}`)
        .then(response => {
            if (response.status >= 200 && response.status <= 299)
                return response.json()
            else
                throw Error(response.statusText);
        })
        .then(data => {

            /* local variables */
            let days = {};
            let hours = {};
            let maxDailyPM25 = 0;
            let maxDailyPM10 = 0;
            let i = 0;
            let formattedData = {}

            /* format data and save it in days object */
            for (i = 0; i < 7; i++) {
                days[i] = {
                    dayString: '',
                    dayNumber: 0,
                    hours: [],
                    maxPM25: 0,
                    maxPM10: 0,
                    healthDataDay: {},
                    healthDataDayPM10: {}
                };

                /* format data and save it in hours object */
                for (let j = 0; j < 24; j++) {
                    hours[j] = {
                        hour: '',
                        hourNumber: 0,
                        healthDataHourPM25: {},
                        healthDataHourPM10: {},
                        aqi: 0,
                        components: [],
                        dt: 0
                    }

                    /* insert data measuremnt of specific hour */
                    hours[j].components = data.list[j + (24 * i)].components;
                    hours[j].dt = data.list[j + (24 * i)].dt
                    const pm25 = Math.floor(calculateAQI(data.list[j + (24 * i)].components.pm2_5, 'pm25'));
                    const pm10 = Math.floor(calculateAQI(data.list[j + (24 * i)].components.pm10, 'pm10'));
                    hours[j].components.pm2_5 = pm25;
                    hours[j].components.pm10 = pm10;
                    hours[j].aqi = pm25;

                    /* see if pm25 and pm10 of this hour are the max values */
                    if (pm25 > days[i].maxPM25)
                        days[i].maxPM25 = pm25;
                    if (pm10 > days[i].maxPM10)
                        days[i].maxPM10 = pm10;

                    /* convert timestamp into hour and hour number */
                    const timestamp = data.list[j + (24 * i)].dt;
                    const date = new Date(timestamp * 1000);
                    const hour = date.toString().split(' ')[4].substring(0, 5);
                    const hourNumber = date.toString().split(' ')[4].substring(0, 2);
                    hours[j].hour = hour;
                    hours[j].hourNumber = hourNumber;

                    /* get respective health data */
                    hours[j].healthDataHourPM25 = mapAQItoHealthData(pm25);
                    hours[j].healthDataHourPM10 = mapAQItoHealthData(pm10);

                    days[i].hours.push(hours[j]);

                }

                /* convert timestamp into day name and number */
                const timestamp = days[i].hours[0].dt;
                const date = new Date();
                date.setTime(timestamp * 1000);
                const dayString = date.toUTCString().substring(0, 3);
                const dayNumber = date.getDate();
                const dateString = dayString + ' ' + dayNumber;
                days[i].dayString = dateString;
                days[i].dayNumber = dayNumber;

                /* find health data for the entire day based on max daily AQI */
                days[i].healthDataDay = mapAQItoHealthData(days[i].maxPM25);
                days[i].healthDataDayPM10 = mapAQItoHealthData(days[i].maxPM10);
            }

            /* find maximum PM25 and PM10 between all days */
            Object.keys(days).forEach(key => {
                if (days[key].maxPM25 > maxDailyPM25)
                    maxDailyPM25 = days[key].maxPM25
                if (days[key].maxPM10 > maxDailyPM10)
                    maxDailyPM10 = days[key].maxPM10
            });

            formattedData.days = days;
            formattedData.hours = hours;
            formattedData.maxDailyPM25 = maxDailyPM25;
            formattedData.maxDailyPM10 = maxDailyPM10;
            showHistoricComponent(formattedData);
        })
        .catch(error => {
            console.log(error);
            displayError();
        })
        .finally(() => {
            countFetched();
        });
}

function displayError() {
    const historySection = document.querySelector(".history");
    historySection.innerHTML = "";
    const div = document.createElement("div");
    div.classList.add("error__message");
    const content = `
        <h3>History</h3>
        <h1>No data available</h1>`;
    div.innerHTML = content;
    historySection.appendChild(div);
}

export { getHistoricAirQuality };