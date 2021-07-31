import { calculateAQI, mapAQItoHealthData } from "../helpers/helpers";

/* create the UI to show historical air quality data */
function showHistoricComponent(data) {

    /* local variables */
    let days = {};
    let hours = {};
    let dayButtons = '';
    let historyTables = '';
    let historyHourlyGraphs = '';
    let historyDailyGraphs = '';
    let maxDailyPM25 = 0;
    let maxDailyPM10 = 0;

    /* format data and save it in days object */
    for (let i = 2; i < 7; i++) {
        days[i] = {
            dayString: '',
            dayNumber: 0,
            hours: [],
            maxPM25: 0,
            maxPM10: 0,
            healthDataDay: {}
        };

        /* format data and save it in hours object */
        for (let j = 0; j < 24; j++) {
            hours[j] = {
                hour: '',
                hourNumber: 0,
                healthDataHour: {},
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
            if (pm25 > days[i].maxPM25)
                days[i].maxPM25 = pm25;
            if (pm10 > days[i].maxPM10)
                days[i].maxPM10 = pm10;

            /* convert timestamp into hour and hour number */
            const timestamp = data.list[j + (24 * i)].dt;
            const date = new Date();
            date.setTime(timestamp * 1000);
            const hour = date.toUTCString().split(' ')[4].substring(0, 5);
            const hourNumber = date.toUTCString().split(' ')[4].substring(0, 2);
            hours[j].hour = hour;
            hours[j].hourNumber = hourNumber;

            /* get respective health data */
            hours[j].healthDataHour = mapAQItoHealthData(pm25);

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
    }

    /* find maximum PM25 and PM10 between all days */
    Object.keys(days).forEach(key => {
        if (days[key].maxPM25 > maxDailyPM25)
            maxDailyPM25 = days[key].maxPM25
        if (days[key].maxPM10 > maxDailyPM10)
            maxDailyPM10 = days[key].maxPM10
    });


    /* create daily graph, containing the max measurement for each day retrieved */
    let historyDailyGraph = `
        <div class="history__graph-daily hide">
            <div class="history__graph-daily-content">
                <div class="history__graph-daily-bars" style="width: calc((${Object.keys(days).length} * 100%) / 7);">`;

    /* for every retrieved day, parse the data and create the HTML content */
    Object.keys(days).forEach((key, i) => {

        /* create day button */
        dayButtons += `<button data-day="${days[key].dayNumber}" class="history__day-btn ${i == 0 ? "history__day-btn--activated" : ""}">${days[key].dayString}</button>\n`;

        /* create table container, containing elements of a particular day */
        let historyTable = `            
            <div class="history__day-data history__day-data-${days[key].dayNumber}" style="${(i != 0) ? "display:none" : ""};">`

        /* create hourly graph container, contining measurements of a particular day */
        let historyHourlyGraph = `
            <div class="history__graph-hourly history__graph-hourly-${days[key].dayNumber} hide">
                <div class="history__graph-hourly-content">
                    <div class="history__graph-hourly-bars history__graph-hourly-bars-${days[key].dayNumber}" style="width: calc((${days[key].hours.length} * 100%) / 24);">`;

        /* create bar for daily graph */
        historyDailyGraph += `
            <div class="history__graph-daily-bar"
                style="background: ${days[key].healthDataDay.gradient}; height: ${(200 * days[key].maxPM25) / maxDailyPM25}px;">
            </div>`;

        /* for every retrieved hour, parse the data and create the html content */
        days[key].hours.forEach((element, j) => {

            /* create table element */
            historyTable += `
                <div class="history__element ${j > 7 ? `history__element-${days[key].dayNumber}--hidden hide` : ""}">
                    <div class="history__element-container">
                        <p class="history_element-time">${element.hour}</p>
                        <div class="history__element-aqi">
                            <div class="history__element-sphere" style="background-color: ${element.healthDataHour.firstColor}">
                                <span>${element.aqi}</span>
                            </div>
                            <p>${(element.healthDataHour.firstColor == '#ff9b57') ? 'Unhealthy' : element.healthDataHour.level}</p>
                        </div>
                        <button class="history__element-btn" data-show="no" data-hour="${element.hourNumber}">show <span>˅</span></button>
                    </div>
                    <div class="history__element-table history__element-table-${days[key].dayNumber}-${element.hourNumber}--hidden hide">
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
                            <p>${element.components.pm10}</p>
                            <p>${element.components.pm2_5}</p>
                        </div>
                    </div>
                </div>`

            /* create bar for hourly graph */
            historyHourlyGraph += `
                <div class="history__graph-hourly-bar"
                    style="background: ${element.healthDataHour.gradient}; height: ${(200 * element.components.pm2_5) / days[key].maxPM25}px;">
                </div>`;

            /* if it's last hour, close the containers */
            if (j == days[key].hours.length - 1) {
                historyTable += `</div>`;
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

        /* if it's last day, close the containers */
        if (i == Object.keys(days).length - 1)
            historyDailyGraph += `
                </div>
            </div>
            <div class="history__graph-daily-side">
                <p>${Math.floor(maxDailyPM25 - (maxDailyPM25 / 3))}</p>
                <p>${Math.floor(maxDailyPM25 - (maxDailyPM25 / 3) * 2)}</p>
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

        /* append elements to containers */
        historyTables += historyTable;
        historyHourlyGraphs += historyHourlyGraph;
    });

    historyDailyGraphs += historyDailyGraph;

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
                    ${dayButtons}
                </div>
                <div class="history__table-head">
                    <p>Hour</p>
                    <p>Air Quality</p>
                    <p>Polluttants</p>
                </div>
                <div class="history__body">
                    ${historyTables}
                    ${historyHourlyGraphs}
                    ${historyDailyGraphs}
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
            const selectedDay = document.querySelector('.history__day-btn--activated').getAttribute('data-day');
            const clickedDay = this.getAttribute('data-day');

            /* highlight clicked day button */
            document.querySelector('.history__day-btn--activated').classList.remove('history__day-btn--activated');
            this.classList.add('history__day-btn--activated');

            if (selectedView == 'table') {

                /* show table data for clicked day */
                document.querySelector(`.history__day-data-${clickedDay}`).style.display = 'block';
                document.querySelector(`.history__day-data-${selectedDay}`).style.display = 'none';

                /* if show more button is activated, deactivate it */
                const showMoreBtn = document.querySelector('.history__more-btn');
                if (showMoreBtn.getAttribute('data-show') == 'yes') {
                    showMoreBtn.setAttribute('data-show', "no");
                    showMoreBtn.innerHTML = 'Show more <span>˅</span>';
                    document.querySelectorAll(`.history__element-${selectedDay}--hidden`).forEach(element => {
                        element.classList.add('hide');
                    });
                }
            } else if (selectedView == 'graph') {

                /* show graph data for clicked day */
                document.querySelectorAll(`.history__graph-hourly`).forEach(element => element.classList.add('hide'));
                document.querySelector(`.history__graph-hourly-${clickedDay}`).classList.remove('hide');
            }
        });
    });

    /* add listener to show-more button in table view */
    document.querySelector('.history__more-btn').addEventListener('click', function () {
        const selectedDay = document.querySelector('.history__day-btn--activated').getAttribute('data-day');

        if (this.getAttribute('data-show') == 'no') {

            /* show hidden table elements for the selected day */
            document.querySelectorAll(`.history__element-${selectedDay}--hidden`).forEach(element => {
                element.classList.remove('hide');
                this.setAttribute('data-show', "yes");
                this.innerHTML = 'Show more <span>˄</span>';
            });
        }
        else {

            /* hide table elements for the selected day */
            document.querySelectorAll(`.history__element-${selectedDay}--hidden`).forEach(element => {
                element.classList.add('hide');
                this.setAttribute('data-show', "no");
                this.innerHTML = 'Show more <span>˅</span>';
            });
        }
    });

    /* add listener to show-more button of every element in table view */
    document.querySelectorAll('.history__element-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const selectedDay = document.querySelector('.history__day-btn--activated').getAttribute('data-day');
            const clickedHour = this.getAttribute('data-hour');

            if (this.getAttribute('data-show') == 'no') {

                /* show hidden polluttants for clicked hour */
                document.querySelector(`.history__element-table-${selectedDay}-${clickedHour}--hidden`).classList.remove('hide');
                this.setAttribute('data-show', "yes");
                this.innerHTML = 'show <span>˄</span>';
            }
            else {

                /* hide polluttants for selected hour */
                document.querySelector(`.history__element-table-${selectedDay}-${clickedHour}--hidden`).classList.add('hide');
                this.setAttribute('data-show', "no");
                this.innerHTML = 'show <span>˅</span>';
            }
        });
    });

    /* add listener to view buttons */
    document.querySelectorAll('.history__view-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const selectedDay = document.querySelector('.history__day-btn--activated').getAttribute('data-day');
            const selectedBtn = document.querySelector('.history__view-btn--activated');

            /* highlight clicked button */
            selectedBtn.classList.remove('history__view-btn--activated');
            this.classList.add('history__view-btn--activated');

            if (this.getAttribute('data-view') == 'graph' && selectedBtn.getAttribute('data-view') == 'table') {

                /* hide table data */
                document.querySelectorAll('.history__day-data').forEach(element => { element.style.display = 'none' });
                document.querySelector('.history__table-head').classList.add('hide');
                document.querySelector('.history__more-btn').classList.add('hide');

                /* show graph data */
                document.querySelector(`.history__graph-hourly-${selectedDay}`).classList.remove('hide');
                document.querySelector('.history__toggle').classList.remove('hide');
                document.querySelector('.history__pm-btns').classList.remove('hide');
            }
            else if (this.getAttribute('data-view') == 'table' && selectedBtn.getAttribute('data-view') == 'graph') {

                /* hide and reset graph data */
                document.querySelector('.history__pm-btns').classList.add('hide');
                document.querySelector('.history__toggle').classList.add('hide');
                document.querySelector('.history__graph-daily').classList.add('hide');
                document.querySelectorAll('.history__graph-hourly').forEach(element => element.classList.add('hide'));
                document.querySelector('.history__toggle-btn').classList.remove('history__toggle--clicked');
                document.querySelector('.history__toggle-btn').setAttribute('data-activated', 'no');

                /* show table data */
                document.querySelector(`.history__day-data-${selectedDay}`).style.display = 'block';
                document.querySelector('.history__table-head').classList.remove('hide');
                document.querySelector('.history__days').classList.remove('hide');
                document.querySelector('.history__more-btn').classList.remove('hide');
            }
        });
    });

    /* add listener to daily-hourly toggle button in graph view */
    document.querySelector('.history__toggle-btn').addEventListener('click', function () {
        const selectedDay = document.querySelector('.history__day-btn--activated').getAttribute('data-day');

        /* change buttons style */
        this.classList.add('history__toggle--clicked');
        this.setAttribute('data-activated', 'yes');

        if (this.getAttribute('data-activated') == 'no') {

            /* hide hourly graph data */
            document.querySelectorAll('.history__graph-hourly').forEach(element => element.classList.add('hide'));
            document.querySelector('.history__days').classList.add('hide');

            /* show daily graph data */
            document.querySelector(`.history__graph-daily`).classList.remove('hide');

        } else {

            /* hide daily graph data */
            document.querySelector('.history__graph-daily').classList.add('hide');

            /* show hourly graph data */
            document.querySelector(`.history__graph-hourly-${selectedDay}`).classList.remove('hide');
            document.querySelector('.history__days').classList.remove('hide');
        }
    });

    /* add listener to PM buttons in graph view */
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