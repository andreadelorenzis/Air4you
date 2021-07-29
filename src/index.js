/* listeners for menu */
const menuBtn = document.querySelector(".nav__menu-open");
const closeBtn = document.querySelector(".nav__menu-close");
const navMenu = document.querySelector(".nav__menu");
menuBtn.addEventListener('click', () => {
    navMenu.classList.add('nav__menu--open');
});
closeBtn.addEventListener('click', () => {
    navMenu.classList.remove('nav__menu--open');
});

/* do this in order for it to work with webpack */
window.initService = initService;
/* initialize Places API */
export function initService() {
    console.log("connected");
    document.querySelector(".search__input").oninput = showPredictions;
}


/* get predictions based on user input from Places API and show them in HTML */
function showPredictions() {
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
                document.querySelector('.search__input').value = '';
                document.querySelector('.search__predictions').classList.remove('search__predictions--activated');
                getCurrentAirQuality(prediction);
                getCoordinates(prediction);
            });
        });
    };
    const searchInput = document.querySelector(".search__input");
    const searchImg = document.querySelector(".search__img");
    const searchList = document.querySelector(".search__predictions");
    searchList.innerHTML = "";
    const value = searchInput.value;
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

function getMapData(lat, lng) {
    document.querySelector('.map').style.height = '600px';
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: lat, lng: lng },
        zoom: 8,
    });
    const minZoomLevel = 6;
    map.addListener('zoom_changed', function () {
        if (map.getZoom() < minZoomLevel) {
            map.setZoom(minZoomLevel);
        }
    });

    map.addListener('tilesloaded', function () {
        const bounds = map.getBounds();

        fetch(`https://api.waqi.info/map/bounds/?token=${process.env.AQICN_KEY}&latlng=${bounds.getNorthEast().lat()},${bounds.getNorthEast().lng()},${bounds.getSouthWest().lat()},${bounds.getSouthWest().lng()}`)
            .then(response => response.json())
            .then(data => {
                data.data.forEach(station => {
                    const center = { lat: station.lat, lng: station.lon };
                    const aqi = parseInt(station.aqi) ? parseInt(station.aqi) : -1;
                    const healthData = mapAQItoHealthData(aqi);
                    const label = { text: `${station.aqi}`, color: '#ffffff', fontSize: '18px' };
                    const image = {
                        url: `./img/${healthData.markerImg}`,
                        labelOrigin: new google.maps.Point(18, 20),
                        scaledSize: new google.maps.Size(35, 70)
                    };

                    const marker = new google.maps.Marker({
                        position: center,
                        label: label,
                        map: map,
                        icon: image,
                        optimized: true
                    });
                });
            });
    });

}

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

/* get lat and lng coordinates with Geocoding API */
function getCoordinates(prediction) {
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?place_id=${prediction.place_id}&key=${process.env.GOOGLE_KEY}`)
        .then(response => response.json())
        .then(data => {
            const lat = data.results[0].geometry.location.lat;
            const lng = data.results[0].geometry.location.lng;

            getHistoricAirQuality(lat, lng);
            getPollutionNews(lat, lng);
            getMapData(lat, lng);
        });
}


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

/* create the UI to show historical air quality data */
function showHistoricComponent(data) {
    let days = {};
    let historyDays = '';
    let historyElements = '';
    let historyHourly = '';
    let historyDaily = '';

    /* format data and save it in days object */
    for (let i = 0; i < 5; i++) {
        days[i] = {
            day: '',
            hours: [],
            maxPM25: 0,
            maxPM10: 0
        };
        for (let j = 0; j < 24; j++) {
            days[i].hours.push(data.list[j + (24 * i)]);
            const pm25 = Math.floor(calculateAQI(data.list[j + (24 * i)].components.pm2_5, 'pm25'));
            const pm10 = Math.floor(calculateAQI(data.list[j + (24 * i)].components.pm10, 'pm10'));
            if (pm25 > days[i].maxPM25)
                days[i].maxPM25 = pm25;
            if (pm10 > days[i].maxPM10)
                days[i].maxPM10 = pm10;
        }
        days[i].day = days[i].hours[0].dt;
    }

    let historyDailyGraph = `
        <div class="history__graph-daily hide">
            <div class="history__graph-daily-content">
                <div class="history__graph-daily-bars" style="width: calc((${Object.keys(days).length} * 100%) / 7);">`;

    /* for every retrieved day, parse the data and create the HTML content */
    Object.keys(days).forEach((key, i) => {

        /* translate timestamp into day name and number */
        const timestamp = days[key].day;
        const date = new Date();
        date.setTime(timestamp * 1000);
        const dayString = date.toUTCString().substring(0, 3);
        const dayNumber = date.getDate();
        const dateString = dayString + ' ' + dayNumber;

        /* create buttons */
        if (i == 0)
            historyDays += `<button data-day="${dayNumber}" class="history__day-btn history__day-btn--activated">${dateString}</button>\n`;
        else
            historyDays += `<button data-day="${dayNumber}" class="history__day-btn">${dateString}</button>\n`;

        /* create history elements container, representing elements of a particular day */
        let historyDayData = (i != 0) ? `            
            <div class="history__day-data history__day-data-${dayNumber}" style="display:none;">`
            :
            `<div class="history__day-data history__day-data-${dayNumber}">`

        let historyHourlyGraph = `
            <div class="history__graph-hourly history__graph-hourly-${dayNumber} hide">
                <div class="history__graph-hourly-content">
                    <div class="history__graph-hourly-bars history__graph-hourly-bars-${dayNumber}" style="width: calc((${days[key].hours.length} * 100%) / 24);">`;

        let maxPM25daily = 0;
        let maxPM10daily = 0;
        Object.keys(days).forEach(key => {
            if (days[key].maxPM25 > maxPM25daily)
                maxPM25daily = days[key].maxPM25
            if (days[key].maxPM10 > maxPM10daily)
                maxPM10daily = days[key].maxPM10
        });
        const healthDataDaily = mapAQItoHealthData(days[key].maxPM25);

        historyDailyGraph += `
            <div class="history__graph-daily-bar"
                style="background: ${healthDataDaily.gradient}; height: ${(200 * days[key].maxPM25) / maxPM25daily}px;">
            </div>`;

        /* for every retrieved hour, parse the data and create the html content */
        days[key].hours.forEach((element, j) => {

            /* get the hour from timestamp */
            const timestamp = element.dt;
            const date = new Date();
            date.setTime(timestamp * 1000);
            const hour = date.toUTCString().split(' ')[4].substring(0, 5);
            const hourNumber = date.toUTCString().split(' ')[4].substring(0, 2);

            /* calculate AQI for PM25 and PM10 and get respective health data */
            const pm25 = element.components.pm2_5 ? Math.floor(calculateAQI(element.components.pm2_5, 'pm25')) : 0;
            const pm10 = element.components.pm10 ? Math.floor(calculateAQI(element.components.pm10, 'pm10')) : 0;
            let aqi = pm25;
            const healthDataHourly = mapAQItoHealthData(aqi);

            /* create history element, representing the air quality values of a specific hour */
            if (j > 7)
                historyDayData += `
                    <div class="history__element history__element-${dayNumber}--hidden hide">
                        <div class="history__element-container">
                            <p class="history_element-time">${hour}</p>
                            <div class="history__element-aqi">
                                <div class="history__element-sphere" style="background-color: ${healthDataHourly.firstColor}">
                                    <span>${aqi}</span>
                                </div>
                                <p>${(healthDataHourly.firstColor == '#ff9b57') ? 'Unhealthy' : healthDataHourly.level}</p>
                            </div>
                            <button class="history__element-btn" data-show="no" data-hour="${hourNumber}">show <span>˅</span></button>
                        </div>
                        <div class="history__element-table history__element-table-${dayNumber}-${hourNumber}--hidden hide">
                            <div class="history__element-table-head">
                                <p>O3</p>
                                <p>NO2</p>
                                <p>SO2</p>
                                <p>CO</p>
                                <p>PM10</p>
                                <p>PM2.5</p>
                            </div>
                            <div class="history__element-table-body">
                                <p>${element.components.o3.toFixed(1)}</p>
                                <p>${element.components.no2.toFixed(1)}</p>
                                <p>${element.components.so2.toFixed(1)}</p>
                                <p>${element.components.co.toFixed(1)}</p>
                                <p>${pm10}</p>
                                <p>${pm25}</p>
                            </div>
                        </div>
                    </div>`
            else
                historyDayData += `
                        <div class="history__element">
                            <div class="history__element-container">
                                <p class="history_element-time">${hour}</p>
                                <div class="history__element-aqi">
                                    <div class="history__element-sphere" style="background-color: ${healthDataHourly.firstColor}">
                                        <span>${aqi}</span>
                                    </div>
                                    <p>${(healthDataHourly.firstColor == '#ff9b57') ? 'Unhealthy' : healthDataHourly.level}</p>
                                </div>
                                <button class="history__element-btn" data-show="no" data-hour="${hourNumber}">show <span>˅</span></button>
                            </div>
                            <div class="history__element-table history__element-table-${dayNumber}-${hourNumber}--hidden hide">
                                <div class="history__element-table-head">
                                    <p>O3</p>
                                    <p>NO2</p>
                                    <p>SO2</p>
                                    <p>CO</p>
                                    <p>PM10</p>
                                    <p>PM2.5</p>
                                </div>
                                <div class="history__element-table-body">
                                    <p>${element.components.o3.toFixed(1)}</p>
                                    <p>${element.components.no2.toFixed(1)}</p>
                                    <p>${element.components.so2.toFixed(1)}</p>
                                    <p>${element.components.co.toFixed(1)}</p>
                                    <p>${pm10}</p>
                                    <p>${pm25}</p>
                                </div>
                            </div>
                        </div>`


            historyHourlyGraph += `
                <div class="history__graph-hourly-bar"
                    style="background: ${healthDataHourly.gradient}; height: ${(200 * pm25) / days[key].maxPM25}px;">
                </div>`;

            /* if last element append closing div to close the container */
            if (j == days[key].hours.length - 1) {
                historyDayData += `</div>`;
                historyHourlyGraph += `
                        </div>
                    </div>
                    <div class="history__graph-hourly-side">
                        <p>${Math.floor(days[key].maxPM25 - (days[key].maxPM25 / 3))}</p>
                        <p>${Math.floor(days[key].maxPM25 - (days[key].maxPM25 / 3) * 2)}</p>
                    </div>
                    <div class="history__graph-hourly-footer">
                        <p>1:00</p>
                        <p>5:00</p>
                        <p>10:00</p>
                        <p>15:00</p>
                        <p>20:00</p>
                        <p>00:00</p>
                    </div>
                </div>`;
            }
        });

        if (i == Object.keys(days).length - 1)
            historyDailyGraph += `
                </div>
            </div>
            <div class="history__graph-daily-side">
                <p>${Math.floor(maxPM25daily - (maxPM25daily / 3))}</p>
                <p>${Math.floor(maxPM25daily - (maxPM25daily / 3) * 2)}</p>
            </div>
            <div class="history__graph-daily-footer">
                <p>07/15</p>
                <p>07/16</p>
                <p>07/17</p>
                <p>07/18</p>
                <p>07/19</p>
                <p>07/20</p>
                <p>07/21</p>
            </div>
        </div>`;

        /* append elements to container */
        historyElements += historyDayData;
        historyHourly += historyHourlyGraph;
    });

    historyDaily += historyDailyGraph;

    /* full html content */
    const htmlContent = `
        <div class="history__container">
            <h3>History</h3>
            <div class="history__view-btns">
                <button class="history__view-btn history__view-btn--activated" data-view="table">Table View</button>
                <button class="history__view-btn" data-view="graph">Graph View</button>
            </div>
            <div class="history__toggle hide">
                <p>Hourly</p>
                <div class="history__toggle-btn" data-activated="no">
                    <div class="history__toggle-sphere">
                    </div>
                </div>
                <p>Daily</p>
            </div>
            <div class="history__table">
                <div class="history__days">
                    ${historyDays}
                </div>
                <div class="history__table-head">
                    <p>Hour</p>
                    <p>Air Quality</p>
                    <p>Polluttants</p>
                </div>
                <div class="history__body">
                    ${historyElements}
                    ${historyHourly}
                    ${historyDaily}
                    <div class="history__pm-btns hide">
                        <button class=" history__pm-btn history__pm25-btn history__pm-btn--activated" data-pm="pm25">PM2.5</button>
                        <button class=" history__pm-btn history__pm10-btn" data-pm="pm10">PM10</button>
                    </div>
                </div>
                <button class="history__more-btn" data-show="no">Show more <span>˅</span></button>
            </div>
        </div> `

    /* add html content to the UI */
    const historySection = document.querySelector('.history');
    const div = document.createElement('div');
    div.innerHTML = htmlContent;
    historySection.innerHTML = '';
    historySection.appendChild(div);

    /* add listener to day buttons */
    document.querySelectorAll('.history__day-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const selectedView = document.querySelector('.history__view-btn--activated').getAttribute('data-view');
            const dayToShow = this.getAttribute('data-day');
            const dayToHide = document.querySelector('.history__day-btn--activated').getAttribute('data-day');
            document.querySelector('.history__day-btn--activated').classList.remove('history__day-btn--activated');
            this.classList.add('history__day-btn--activated');

            if (selectedView == 'table') {
                document.querySelector(`.history__day-data-${dayToShow}`).style.display = 'block';
                document.querySelector(`.history__day-data-${dayToHide}`).style.display = 'none';
                const showMoreBtn = document.querySelector('.history__more-btn');
                if (showMoreBtn.getAttribute('data-show') == 'yes') {
                    showMoreBtn.setAttribute('data-show', "no");
                    showMoreBtn.innerHTML = 'Show more <span>˅</span>';
                    document.querySelectorAll(`.history__element-${dayToHide}--hidden`).forEach(element => {
                        element.classList.add('hide');
                    });
                }
            } else if (selectedView == 'graph') {
                const selectedDay = document.querySelector('.history__day-btn--activated').getAttribute('data-day');
                document.querySelectorAll(`.history__graph-hourly`).forEach(element => element.classList.add('hide'));
                document.querySelector(`.history__graph-hourly-${selectedDay}`).classList.remove('hide');
            }
        });
    });

    /* add listener to show more elements button */
    document.querySelector('.history__more-btn').addEventListener('click', function () {
        const selectedDay = document.querySelector('.history__day-btn--activated').getAttribute('data-day');
        if (this.getAttribute('data-show') == 'no') {
            document.querySelectorAll(`.history__element-${selectedDay}--hidden`).forEach(element => {
                element.classList.remove('hide');
                this.setAttribute('data-show', "yes");
                this.innerHTML = 'Show more <span>˄</span>';
            });
        }
        else {
            document.querySelectorAll(`.history__element-${selectedDay}--hidden`).forEach(element => {
                element.classList.add('hide');
                this.setAttribute('data-show', "no");
                this.innerHTML = 'Show more <span>˅</span>';
            });
        }
    });

    /* add listener to show more values button */
    document.querySelectorAll('.history__element-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const dayNumber = document.querySelector('.history__day-btn--activated').getAttribute('data-day');
            const hour = this.getAttribute('data-hour');
            if (this.getAttribute('data-show') == 'no') {
                document.querySelector(`.history__element-table-${dayNumber}-${hour}--hidden`).classList.remove('hide');
                this.setAttribute('data-show', "yes");
                this.innerHTML = 'show <span>˄</span>';
            }
            else {
                document.querySelector(`.history__element-table-${dayNumber}-${hour}--hidden`).classList.add('hide');
                this.setAttribute('data-show', "no");
                this.innerHTML = 'show <span>˅</span>';
            }
        });
    });

    /* add listener to change from table view to graph view */
    document.querySelectorAll('.history__view-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const selectedDay = document.querySelector('.history__day-btn--activated').getAttribute('data-day');
            const selectedBtn = document.querySelector('.history__view-btn--activated');
            if (this.getAttribute('data-view') == 'graph' && selectedBtn.getAttribute('data-view') == 'table') {
                document.querySelectorAll('.history__day-data').forEach(element => { element.style.display = 'none' });
                document.querySelector('.history__table-head').classList.add('hide');
                document.querySelector('.history__more-btn').classList.add('hide');
                document.querySelector(`.history__graph-hourly-${selectedDay}`).classList.remove('hide');
                selectedBtn.classList.remove('history__view-btn--activated');
                this.classList.add('history__view-btn--activated');
                document.querySelector('.history__toggle').classList.remove('hide');
                document.querySelector('.history__pm-btns').classList.remove('hide');
            }
            else if (this.getAttribute('data-view') == 'table' && selectedBtn.getAttribute('data-view') == 'graph') {
                document.querySelector(`.history__day-data-${selectedDay}`).style.display = 'block';
                document.querySelector('.history__table-head').classList.remove('hide');
                document.querySelector('.history__more-btn').classList.remove('hide');
                document.querySelectorAll('.history__graph-hourly').forEach(element => element.classList.add('hide'));
                document.querySelector('.history__graph-daily').classList.add('hide');
                selectedBtn.classList.remove('history__view-btn--activated');
                this.classList.add('history__view-btn--activated');
                document.querySelector('.history__toggle').classList.add('hide');
                document.querySelector('.history__toggle-btn').classList.remove('history__toggle--clicked');
                document.querySelector('.history__toggle-btn').setAttribute('data-activated', 'no');
                document.querySelector('.history__days').classList.remove('hide');
                document.querySelector('.history__pm-btns').classList.add('hide');
            }
        });
    });

    /* add listener to go from hourly to daily in graph view */
    document.querySelector('.history__toggle-btn').addEventListener('click', function () {
        const selectedDay = document.querySelector('.history__day-btn--activated').getAttribute('data-day');
        if (this.getAttribute('data-activated') == 'no') {
            this.classList.add('history__toggle--clicked');
            this.setAttribute('data-activated', 'yes');
            document.querySelectorAll('.history__graph-hourly').forEach(element => element.classList.add('hide'));
            document.querySelector(`.history__graph-daily`).classList.remove('hide');
            document.querySelector('.history__days').classList.add('hide');
        } else {
            this.classList.remove('history__toggle--clicked');
            this.setAttribute('data-activated', 'no');
            document.querySelector('.history__graph-daily').classList.add('hide');
            document.querySelector(`.history__graph-hourly-${selectedDay}`).classList.remove('hide');
            document.querySelector('.history__days').classList.remove('hide');
        }
    });

    /* add listener to change from pm2.5 to pm10 in graph view */
    document.querySelectorAll('.history__pm-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const selectedBtn = document.querySelector('.history__pm-btn--activated');
            if (this.getAttribute('data-pm') == 'pm25' && selectedBtn.getAttribute('data-pm') == 'pm10') {
                selectedBtn.classList.remove('history__pm-btn--activated');
                this.classList.add('history__pm-btn--activated');
            } else if (this.getAttribute('data-pm') == 'pm10' && selectedBtn.getAttribute('data-pm') == 'pm25') {
                selectedBtn.classList.remove('history__pm-btn--activated');
                this.classList.add('history__pm-btn--activated');
            }
        });
    });
}

/* create the UI to show environment news for a specified country or city */
function showNewsComponent(data, country) {
    let newsArticles = ``;

    data.news.forEach((article, i) => {
        if (i < 3) {
            newsArticles += `
                <article class="news__article">
                    <a class="news__article-inside" href="${article.url}" target="_blank">            
                        <div class="news__article-text">
                            <h2>${article.author}</h2>
                            <p>${article.title}</p>
                        </div>
                        ${article.image == 'None' ? '' : `<img src="${article.image}" alt="image"></img>`}
                    </a>
                </article>`;
        } else {
            newsArticles += `
                <article class="news__article hide">
                    <a class="news__article-inside" href="${article.url}" target="_blank">            
                        <div class="news__article-text">
                            <h2>${article.author}</h2>
                            <p>${article.title}</p>
                        </div>
                        ${article.image == 'None' ? '' : `<img src="${article.image}" alt="image"></img>`}
                    </a>
                </article>`;
        }
    });

    const htmlContent = `
        <h3>Pollution articles for ${country}</h3>
        ${newsArticles}
        <button class="news__show-btn" data-show="no">Show More <span>˅</span></button>`;

    const newsSection = document.querySelector('.news');
    const div = document.createElement('div');
    div.innerHTML = htmlContent;
    newsSection.innerHTML = '';
    newsSection.appendChild(div);
    div.classList.add("news__container");

    document.querySelector('.news__show-btn').addEventListener('click', function () {
        if (this.getAttribute('data-show') == 'no') {
            this.setAttribute('data-show', 'yes');
            this.innerHTML = "Show More <span>˄</span>";
            document.querySelectorAll('.news__article').forEach(article => article.classList.remove('hide'));
        } else {
            this.setAttribute('data-show', 'no');
            this.innerHTML = "Show More <span>˅</span>";
            document.querySelectorAll('.news__article').forEach((article, i) => {
                if (i >= 3 && i < 6) {
                    article.classList.add('hide');
                }
            });
        }
    });
}

/* create the UI to show current air quality data */
function showCurrentComponent(data, prediction, isAlternative) {
    let aqi = 0,
        co = 0,
        coColor = '',
        no2 = 0,
        no2Color = '',
        o3 = 0,
        o3Color = '',
        so2 = 0,
        so2Color = '',
        pm10 = 0,
        pm10Color = '',
        pm25 = 0,
        pm25Color = '',
        h = 0,
        p = 0,
        t = 0,
        w = 0,
        healthData,
        recommendations = '';
    let city = prediction.terms[0].value;

    if (isAlternative == false) {
        aqi = data.aqi ? data.aqi : 0;
        co = data.iaqi.co ? data.iaqi.co.v : 0;
        no2 = data.iaqi.no2 ? data.iaqi.no2.v : 0;
        o3 = data.iaqi.o3 ? data.iaqi.o3.v : 0;
        so2 = data.iaqi.so2 ? data.iaqi.so2.v : 0;
        pm10 = data.iaqi.pm10 ? data.iaqi.pm10.v : 0;
        pm25 = data.iaqi.pm25 ? data.iaqi.pm25.v : 0;
        h = data.iaqi.h ? data.iaqi.h.v : 0;
        p = data.iaqi.p ? data.iaqi.p.v : 0;
        t = data.iaqi.t ? data.iaqi.t.v : 0;
        w = data.iaqi.w ? data.iaqi.w.v : 0;
        healthData = mapAQItoHealthData(data.aqi);
        coColor = mapAQItoHealthData(co).firstColor;
        no2Color = mapAQItoHealthData(no2).firstColor;
        o3Color = mapAQItoHealthData(o3).firstColor;
        so2Color = mapAQItoHealthData(so2).firstColor;
        pm10Color = mapAQItoHealthData(pm10).firstColor;
        pm25Color = mapAQItoHealthData(pm25).firstColor;
    }
    else {
        co = data.components.co ? data.components.co + ' ug/m3' : 0;
        no2 = data.components.no2 ? data.components.no2 + ' ug/m3' : 0;
        o3 = data.components.o3 ? data.components.o3 + ' ug/m3' : 0;
        so2 = data.components.so2 ? data.components.so2 + ' ug/m3' : 0;
        pm10 = data.components.pm10 ? Math.floor(calculateAQI(data.components.pm10, 'pm10')) : 0;
        pm25 = data.components.pm2_5 ? Math.floor(calculateAQI(data.components.pm2_5, 'pm25')) : 0;
        aqi = pm25;
        healthData = mapAQItoHealthData(pm25);
        pm10Color = mapAQItoHealthData(pm10).firstColor;
        pm25Color = healthData.firstColor;
    }

    const currentSection = document.querySelector('.current');
    const title = document.querySelector('.city-name');
    title.innerHTML = `Air Quality for ${city}`;
    if (aqi <= 100)
        for (let i = 0; i < 2; i++) {
            recommendations += `
            <div class="current__recommendation">
                <img src="./img/${healthData.recommendations[i].img}" alt="windows">
                <p>${healthData.recommendations[i].text}</p>
            </div>`;
        }
    else
        for (let i = 0; i < 4; i++) {
            recommendations += `
            <div class="current__recommendation">
                <img src="./img/${healthData.recommendations[i].img}" alt="windows">
                <p>${healthData.recommendations[i].text}</p>
            </div>`;
        }
    const htmlContent = `
        <div class="current__headline" style="background-color: ${healthData.firstColor};">
            <div class="current__aqi" style="background-color: ${healthData.secondColor};">
                <span>${aqi}</span>
            </div>
            <div class="current__health">
                <p style="color: ${healthData.thirdColor};">Live aqi index</p>
                <span style="color: ${healthData.thirdColor};">${healthData.level}</span>
            </div>
        </div>
        <div class="current__container">
            <h3>Current air quality</h3>
            <div class="current__data">
                <div class="current__polluttants">
                    <h2>Polluttants</h2>
            ${co ? `<div class="current__polluttant">
                        <p>Carbon Monoxyde</p>
                        <span ${coColor ? `style=background-color:${coColor}; color: #fff; border: none;` : ''}>${co}</span>
                    </div>` : ''}
            ${so2 ? `<div class="current__polluttant">
                        <p>Sulfure Dioxyde</p>
                        <span ${so2Color ? `style=background-color:${so2Color}; color: #fff; border: none;` : ''}>${so2}</span>
                    </div>` : ''}
            ${no2 ? `<div class="current__polluttant">
                        <p>Nitrogen Monoxyde</p>
                        <span ${no2Color ? `style=background-color:${no2Color}; color: #fff; border: none;` : ''}>${no2}</span>
                    </div>` : ''}
            ${o3 ? `<div class="current__polluttant">
                        <p>Ozone</p>
                        <span ${o3Color ? `style=background-color:${o3Color}; color: #fff; border: none;` : ''}>${o3}</span>
                    </div>` : ''}
            ${pm10 ? `<div class="current__polluttant">
                        <p>PM10</p>
                        <span ${pm10Color ? `style=background-color:${pm10Color}; color: #fff; border: none;` : ''}>${pm10}</span>
                    </div>` : ''}
            ${pm25 ? `<div class="current__polluttant">
                        <p>PM2.5</p>
                        <span ${pm25Color ? `style=background-color:${pm25Color}; color: #fff; border: none;` : ''}>${pm25}</span>
                    </div>` : ''}
                </div>
            ${isAlternative ? '' :
            `                
                <div class="current__weather">
                    <h2>Weather Conditions</h2>
            ${h ? ` <div class="current__condition">
                        <p>Relative Humidity</p>
                        <span>${h}</span>
                    </div>` : ''}
            ${p ? ` <div class="current__condition">
                        <p>Atmospheric Pressure</p>
                        <span>${p}</span>
                    </div>` : ''}
            ${t ? ` <div class="current__condition">
                        <p>Temperature</p>
                        <span>${t}</span>
                    </div>` : ''}
            ${w ? ` <div class="current__condition">
                        <p>Wind</p>
                        <span>${w}</span>
                    </div>` : ''}
                </div>`}
            </div>
            <h3>Health recommendations</h3>
            <div class="current__recommendations">
                ${recommendations}
            </div>
        </div>`
    const div = document.createElement('div');
    div.innerHTML = htmlContent;
    currentSection.innerHTML = '';
    currentSection.appendChild(div);
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('section--activated');
    });
    document.querySelector('.api-container').classList.add('api-container--activated');
}

function calculateAQI(value, polluttant) {
    const breakpoints_pm25 = [
        {
            "BPL": 0,
            "BPH": 12,
            "IL": 0,
            "IH": 50
        },
        {
            "BPL": 12,
            "BPH": 35,
            "IL": 51,
            "IH": 100
        },
        {
            "BPL": 35,
            "BPH": 55,
            "IL": 101,
            "IH": 150
        },
        {
            "BPL": 55,
            "BPH": 150,
            "IL": 151,
            "IH": 200
        },
        {
            "BPL": 150,
            "BPH": 250,
            "IL": 201,
            "IH": 300
        },
        {
            "BPL": 250,
            "BPH": 350,
            "IL": 301,
            "IH": 400
        },
        {
            "BPL": 350,
            "BPH": 500,
            "IL": 401,
            "IH": 500
        }
    ];

    const breakpoints_pm10 = [
        {
            "BPL": 0,
            "BPH": 54,
            "IL": 0,
            "IH": 50
        },
        {
            "BPL": 55,
            "BPH": 154,
            "IL": 51,
            "IH": 100
        },
        {
            "BPL": 155,
            "BPH": 254,
            "IL": 101,
            "IH": 150
        },
        {
            "BPL": 255,
            "BPH": 354,
            "IL": 151,
            "IH": 200
        },
        {
            "BPL": 355,
            "BPH": 424,
            "IL": 201,
            "IH": 300
        },
        {
            "BPL": 425,
            "BPH": 504,
            "IL": 301,
            "IH": 400
        },
        {
            "BPL": 505,
            "BPH": 604,
            "IL": 401,
            "IH": 500
        }
    ];

    let BPH,
        BPL,
        IH,
        IL;

    if (value > 500)
        return 500;

    if (polluttant == 'pm25')
        for (let i = 0; i < breakpoints_pm25.length; i++) {
            if (value >= breakpoints_pm25[i].BPL && value <= breakpoints_pm25[i].BPH) {
                BPL = breakpoints_pm25[i].BPL;
                BPH = breakpoints_pm25[i].BPH;
                IL = breakpoints_pm25[i].IL;
                IH = breakpoints_pm25[i].IH;
            }
        }
    else
        for (let i = 0; i < breakpoints_pm10.length; i++) {
            if (value >= breakpoints_pm10[i].BPL && value <= breakpoints_pm10[i].BPH) {
                BPL = breakpoints_pm10[i].BPL;
                BPH = breakpoints_pm10[i].BPH;
                IL = breakpoints_pm10[i].IL;
                IH = breakpoints_pm10[i].IH;
            }
        }

    let AQI = (IH - IL) / (BPH - BPL) * (value - BPL) + IL;
    if (!AQI) {
        return -1;
    }

    return AQI;
}

function mapAQItoHealthData(aqi) {
    if (aqi == -1)
        return {
            level: 'n/a',
            firstColor: '#fff',
            secondColor: '#fff',
            thirdColor: '#fff',
            gradient: '#fff',
            recommendations: [],
            markerImg: ''
        }

    if (aqi >= 0 && aqi <= 50)
        return {
            level: 'Healthy',
            firstColor: '#A8E05F',
            secondColor: '#87C13C',
            thirdColor: '#607631',
            gradient: 'linear-gradient(0deg, rgba(168, 224, 95, 0.60), #A8E05F 80%)',
            recommendations: [
                {
                    text: 'Open your windows to bring clean, fresh air indoors',
                    img: 'window-green.png'
                },
                {
                    text: 'Enjoy outdoor activities',
                    img: 'bike-green.png'
                }
            ],
            markerImg: 'marker-green.png'
        }
    if (aqi >= 51 && aqi <= 100)
        return {
            level: 'Moderate',
            firstColor: '#fdd64b',
            secondColor: '#efbe1d',
            thirdColor: '#8c6c1d',
            gradient: 'linear-gradient(0deg, rgba(253, 214, 75, 0.60), #fdd64b 80%)',
            recommendations: [
                {
                    text: 'Close your windows to avoid dirty outdoor air',
                    img: 'window-yellow.png'
                },
                {
                    text: 'Sensitive groups should reduce outdoor exercise',
                    img: 'bike-yellow.png'
                }
            ],
            markerImg: 'marker-yellow.png'
        }
    if (aqi >= 101 && aqi <= 150)
        return {
            level: 'Unhealthy for Sensitive Groups',
            firstColor: '#ff9b57',
            secondColor: '#f27e2f',
            thirdColor: '#974a20',
            gradient: 'linear-gradient(0deg, rgba(255, 155, 87, 0.60), #ff9b57 80%)',
            recommendations: [
                {
                    text: 'Close your windows to avoid dirty outdoor air',
                    img: 'window-orange.png'
                },
                {
                    text: 'Everyone should reduce outdoor exercise',
                    img: 'bike-orange.png'
                },
                {
                    text: 'Sensitive groups should wear a mask outdoors',
                    img: 'mask-orange.png'
                },
                {
                    text: 'Could run an air purifier',
                    img: 'purifier-orange.png'
                }
            ],
            markerImg: 'marker-red.png'
        }
    if (aqi >= 151 && aqi <= 200)
        return {
            level: 'Unhealthy',
            firstColor: '#fe6a69',
            secondColor: '#e84b50',
            thirdColor: '#942431',
            gradient: 'linear-gradient(0deg, rgba(254, 106, 105, 0.60), #fe6a69 80%)',
            recommendations: [
                {
                    text: 'Close your windows to avoid dirty outdoor air',
                    img: 'window-red.png'
                },
                {
                    text: 'Avoid outdoor exercise',
                    img: 'bike-red.png'
                },
                {
                    text: 'Wear a mask outdoor',
                    img: 'mask-red.png'
                },
                {
                    text: 'Run an air purifier',
                    img: 'purifier-red.png'
                }
            ],
            markerImg: 'marker-violet.png'
        }
    if (aqi >= 201 && aqi <= 300)
        return {
            level: 'Very Unhealthy',
            firstColor: '#a14eca',
            secondColor: '#660099',
            thirdColor: '#440065',
            gradient: 'linear-gradient(0deg, rgba(161, 78, 202, 0.60), #a14eca 80%)',
            recommendations: [
                {
                    text: 'Close your windows to avoid dirty outdoor air',
                    img: 'window-violet.png'
                },
                {
                    text: 'Avoid outdoor exercise',
                    img: 'bike-violet.png'
                },
                {
                    text: 'Wear a mask outdoor',
                    img: 'mask-violet.png'
                },
                {
                    text: 'Run an air purifier',
                    img: 'purifier-violet.png'
                }
            ],
            markerImg: 'marker-red.png'
        }
    if (aqi >= 301)
        return {
            level: 'Hazardous',
            firstColor: '#94193B',
            secondColor: '#C54669',
            thirdColor: '#5f001b',
            gradient: 'linear-gradient(0deg, rgba(148, 25, 59, 0.60), #94193B 80%)',
            recommendations: [
                {
                    text: 'Close your windows to avoid dirty outdoor air',
                    img: 'window-magenta.png'
                },
                {
                    text: 'Avoid outdoor exercise',
                    img: 'bike-magenta.png'
                },
                {
                    text: 'Wear a mask outdoor',
                    img: 'mask-magenta.png'
                },
                {
                    text: 'Run an air purifier',
                    img: 'purifier-magenta.png'
                }
            ],
            markerImg: 'marker-magenta.png'
        }
}

const countries = {
    "United States": "US",
    "Taiwan": "TW",
    "German": "DE",
    "United Kingdom": "GB",
    "China": "CN",
    "India": "IN",
    "Spain": "ES",
    "Italy": "IT",
    "Poland": "PL",
    "Australia": "AU",
    "Malaysia": "MY",
    "Singapore": "SG",
    "Canada": "CA",
    "South Korea": "KR",
    "Denmark": "DK",
    "France": "FR",
    "Belgium": "BE",
    "Japan": "JP",
    "Austria": "AT",
    "Portugal": "PT",
    "Philippines": "PH",
    "Hong Kong": "HK",
    "Argentina": "AR",
    "Venezuela": "VE",
    "Brazil": "BR",
    "Finland": "FI",
    "Indonedia": "ID",
    "Vietnam": "VN",
    "Mexico": "MX",
    "Greece": "GR",
    "Netherlands": "NL",
    "Norway": "NO",
    "New Zealand": "NZ",
    "Russia": "RU",
    "Saudi-Arabia": "SA",
    "Switzerland": "CH",
    "Thailand": "TH",
    "United Arab Emirates": "AE",
    "Ireland": "IE",
    "Iran": "IR",
    "Iraq": "IQ",
    "Romania": "RO",
    "Afghanistan": "AF",
    "Zimbabwe": "ZW",
    "Myanmar": "MM",
    "Sweden": "SE",
    "Peru": "PE",
    "Panama": "PA",
    "Egypt": "EG",
    "Turkey": "TR",
    "Israel": "IL",
    "Czech Republic": "CZ",
    "Bangladesh": "BD",
    "Nigeria": "NG",
    "Kenya": "KE",
    "Chile": "CL",
    "Uruguay": "UY",
    "Ecuador": "EC",
    "Serbia": "RS",
    "Hungary": "HU",
    "Slovenia": "SI",
    "Gahana": "GH",
    "Bolivia": "BO",
    "Pakistan": "PK",
    "Colombia": "CO",
    "North Korea": "NK",
    "Paraguay": "PY",
    "Palestine": "PS",
    "Estonia": "EE",
    "Lebanon": "LB",
    "Qatar": "QA",
    "Kuwait": "KW",
    "Cambodia": "KH",
    "Nepal": "NP",
    "Luxembourg": "LU",
    "Bosnia": "BA",
    "Europe": "EU",
    "Asia": "ASIA",
    "International": "INT"
}