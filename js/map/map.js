import { getCurrentAirQuality } from "../currentData/getCurrentData";
import { mapAQItoHealthData } from "../helpers/helpers";
import { getHistoricAirQuality } from "../historicData/getHistoricData";
import { getPollutionNews } from "../news/getNews";

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

    let lastInfoWindow = false;
    map.addListener('tilesloaded', function () {
        const bounds = map.getBounds();
        fetch(`https://api.waqi.info/map/bounds/?token=${process.env.AQICN_KEY}&latlng=${bounds.getNorthEast().lat()},${bounds.getNorthEast().lng()},${bounds.getSouthWest().lat()},${bounds.getSouthWest().lng()}`)
            .then(response => response.json())
            .then(data => {
                data.data.forEach((element, i) => {
                    const center = { lat: element.lat, lng: element.lon };
                    const aqi = parseInt(element.aqi) ? parseInt(element.aqi) : -1;
                    const healthData = mapAQItoHealthData(aqi);
                    const label = { text: `${element.aqi}`, color: '#ffffff', fontSize: '18px' };
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
                        optimized: false
                    });
                    const lat = element.lat;
                    const lng = element.lon;
                    const name = element.station.name;
                    marker.id = i;
                    const contentString = `
                        <div class="info-window">
                        <p class="info-window__title">${element.station.name}</p>
                        <p class="info-window__aqi"  style="background-color: ${healthData.firstColor};">${element.aqi}</p>
                        <button type="button" class="info-window__btn" id="info-window-${marker.id}">SEE DETAILS</button>
                        </div>`;
                    const infowindow = new google.maps.InfoWindow({
                        content: contentString
                    });
                    marker.addListener("click", () => {

                        if (lastInfoWindow)
                            lastInfoWindow.close();
                        lastInfoWindow = infowindow;
                        infowindow.open({
                            anchor: marker,
                            map,
                            shouldFocus: true
                        });

                        setTimeout(() => {
                            const infowindowBtn = document.getElementById(`info-window-${marker.id}`);
                            infowindowBtn.addEventListener("click", () => {
                                getCurrentAirQuality(name);
                                getHistoricAirQuality(lat, lng);
                                getPollutionNews(lat, lng);
                                getMapData(lat, lng);
                                document.body.scrollTop = 0;   // for Safari
                                document.documentElement.scrollTop = 0;   // for Chrome, Firefox, IE and Opera
                            });
                        }, 20);
                    });
                });
            });
    });
}

export { getMapData };