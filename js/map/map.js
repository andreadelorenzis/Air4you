import { mapAQItoHealthData } from "../helpers/helpers";

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

export { getMapData };