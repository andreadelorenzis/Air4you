import { calculateAQI, mapAQItoHealthData } from "../helpers/helpers";

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

export { showHistoricComponent };