import { calculateAQI, mapAQItoHealthData } from "../helpers/helpers";

/* create the UI to show current air quality data */
function showCurrentComponent(data, prediction, isAlternative) {

    /* local variables */
    let aqi = 0,
        co = 0,
        no2 = 0,
        o3 = 0,
        so2 = 0,
        pm10 = 0,
        pm25 = 0,
        h = 0,
        p = 0,
        t = 0,
        w = 0,
        coColor = '',
        no2Color = '',
        o3Color = '',
        so2Color = '',
        pm10Color = '',
        pm25Color = '',
        healthData = {},
        recommendations_1 = '',
        recommendations_2 = '',
        city = '';
    const currentSection = document.querySelector('.current');
    const title = document.querySelector('.city-name');
    const subtitle = document.querySelector('.city-name-subtitle');

    if (typeof prediction == "string")
        city = prediction;
    else
        city = prediction.description;

    title.innerHTML = `Air Quality in ${city}`;
    subtitle.innerHTML = `Air quality index (AQI) and more air pollution data in ${city}`

    /* fill variables with data from WAQI API or from OpenWeather API depending on value of isAlternative */
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

    /* HTML for the recommendations sub-section */
    for (let i = 0; i < 4; i++) {
        if (i < 2)
            recommendations_1 += `
            <div class="current__recommendation">
                <img src="./img/${healthData.recommendations[i].img}" alt="windows">
                <p>${healthData.recommendations[i].text}</p>
            </div>`;
        else if (i >= 2 && aqi >= 100)
            recommendations_2 += `
            <div class="current__recommendation">
                <img src="./img/${healthData.recommendations[i].img}" alt="windows">
                <p>${healthData.recommendations[i].text}</p>
            </div>`;
    }

    /* HTML for the entire current section */
    const htmlContent = `
        <div class="current__headline" style="background-color: ${healthData.firstColor};">
            <div class="current__aqi" style="background-color: ${healthData.secondColor};">
                <span>${aqi}</span>
            </div>
            <div class="current__health">
                <p style="color: ${healthData.thirdColor};">Live aqi index</p>
                <span style="color: ${healthData.thirdColor};">${healthData.level}</span>
            </div>
            <img src="./img/${healthData.emoji}" alt="smile" class="current__headline-emoji">
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
            ${isAlternative ? `
            
            <div class="current__weather">
                <h2>Weather Conditions</h2>
                <p class="current__weather-error">- Not available -</p>
            </div>`
            :
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
                ${recommendations_1}
                ${recommendations_2}
            </div>
        </div>`

    /* insert the HTML content in the page */
    const div = document.createElement('div');
    div.innerHTML = htmlContent;
    currentSection.innerHTML = '';
    currentSection.appendChild(div);
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('section--activated');
    });
    document.querySelector('.api-container').classList.add('api-container--activated');
}

export { showCurrentComponent };