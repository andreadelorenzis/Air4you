import { getCurrentAirQuality } from "../current/getCurrentData";
import { mapAQItoHealthData } from "../helpers/helpers";
import { getHistoricAirQuality } from "../history/getHistoricData";
import { getPollutionNews } from "../news/getNews";
import { countFetched } from "../index";

/* show map with AQICN measuring stations */
function getMapData(lat, lng, city) {

    /* local variables */
    const mapContainer = document.querySelector('.map__container');
    const mapTitle = document.querySelector('.map__title');
    let lastInfoWindow = false;
    const minZoomLevel = 6;

    mapContainer.style.height = '600px';

    /* hide map */
    mapContainer.style.visibility = "hidden";
    mapTitle.style.visibility = "hidden";

    /* create map title */
    const h3 = document.createElement("h3");
    mapTitle.innerHTML = "";
    h3.innerHTML = `map for ${city}`;
    mapTitle.appendChild(h3);

    /* create the map using Google API */
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: lat, lng: lng },
        zoom: 8,
    });

    /* limit the zoom level */
    map.addListener('zoom_changed', function () {
        if (map.getZoom() < minZoomLevel) {
            map.setZoom(minZoomLevel);
        }
    });

    /* when the map is loaded */
    map.addListener('tilesloaded', function () {

        /* get map window bounds */
        const bounds = map.getBounds();

        /* get AQICN data within the bounds given by the map window */
        fetch(`https://api.waqi.info/map/bounds/?token=${process.env.AQICN_KEY}&latlng=${bounds.getNorthEast().lat()},${bounds.getNorthEast().lng()},${bounds.getSouthWest().lat()},${bounds.getSouthWest().lng()}`)
            .then(response => {
                if (response.status >= 200 && response.status <= 299)
                    return response.json()
                else
                    throw Error(response.statusText);
            })
            .then(data => {

                /* show map */
                mapContainer.style.visibility = "visible";
                mapTitle.style.visibility = "visible";

                /* create station markers */
                data.data.forEach((element, i) => {

                    /* create marker */
                    const center = { lat: element.lat, lng: element.lon };
                    const aqi = parseInt(element.aqi) ? parseInt(element.aqi) : -1;
                    const healthData = mapAQItoHealthData(aqi);
                    const label = { text: `${element.aqi}`, color: '#ffffff', fontSize: '18px' };
                    const image = {
                        url: `${healthData.markerImg}`,
                        labelOrigin: new google.maps.Point(18, 20),
                        scaledSize: new google.maps.Size(35, 70)
                    };
                    const marker = new google.maps.Marker({
                        position: center,
                        label: label,
                        map: map,
                        icon: image,
                        optimized: false
                    });
                    marker.id = i;

                    /* create infowindow */
                    const lat = element.lat;
                    const lng = element.lon;
                    const name = element.station.name;
                    const uid = element.uid;
                    const contentString = `
                            <div class="info-window">
                                <p class="info-window__title">${element.station.name}</p>
                                <p class="info-window__aqi"  style="background-color: ${healthData.firstColor};">${element.aqi}</p>
                                <button type="button" class="info-window__btn" id="info-window-${marker.id}">SEE DETAILS</button>
                            </div>`;
                    const infowindow = new google.maps.InfoWindow({
                        content: contentString
                    });

                    /* show infowindow when a marker is clicked */
                    marker.addListener("click", () => {

                        /* close previous opened infowindow, if any */
                        if (lastInfoWindow)
                            lastInfoWindow.close();
                        lastInfoWindow = infowindow;
                        infowindow.open({
                            anchor: marker,
                            map,
                            shouldFocus: true
                        });

                        /* when the button inside an infowindow is clicked, search for the respective city data */
                        setTimeout(() => {
                            const infowindowBtn = document.getElementById(`info-window-${marker.id}`);
                            infowindowBtn.addEventListener("click", () => {

                                /* display data */
                                getCurrentAirQuality(name, uid);
                                getHistoricAirQuality(lat, lng);
                                getPollutionNews(lat, lng);
                                getMapData(lat, lng, name);

                                /* scroll to the top */
                                document.body.scrollTop = 0;   // for Safari
                                document.documentElement.scrollTop = 0;   // for Chrome, Firefox, IE and Opera

                            });
                        }, 20);
                    });
                });
            })
            .catch(error => {
                console.log(error);

                /* show map  */
                mapContainer.style.visibility = "visible";
                mapTitle.style.visibility = "visible";
                displayError();
            })
            .finally(() => {
                countFetched();
            });
    });
}

/* show message error */
function displayError() {
    const mapContainer = document.querySelector(".map__container");
    const mapTitle = document.querySelector(".map__title");
    mapContainer.innerHTML = "";
    const div = document.createElement("div");
    div.classList.add("error__message");
    const content = "<h1>Failed to load the map</h1>";
    div.innerHTML = content;
    mapTitle.innerHTML = "<h3>Map</h3>";
    mapContainer.appendChild(div);
}

export { getMapData };