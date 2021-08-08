# Airlytics
Air quality visualization around the world.

<img src="https://github.com/andreadelorenzis/Airlytics/blob/main/img/app-screen.PNG?raw=true" alt="screen" width="750" />

## Features 
- City search with suggestions list
- Current air quality data (up to one hour delay)
- Historic data (up to seven days) 
- Pollution news for the selected place
- Map of AQI levels around the selected city

## Technologies and tools
- HTML and CSS
- Javascript
- Webpack

## Getting started
1. Get these free API Keys
	- <a href="https://home.openweathermap.org/users/sign_up" target="_blank">OpenWeather API</a> (historic data)
	- <a href="https://aqicn.org/data-platform/token/#/" target="_blank">AQICN API</a> (current data)
	- <a href="https://www.currentsapi.services/en" target="_blank">Currents API</a> (news articles)
	- <a href="https://developers.google.com/maps/documentation/javascript/overview" target="_blank">Google Maps Javascript API</a> (Places, Geocoding and Maps)
2. Clone the repo
<code>git clone https://github.com/andreadelorenzis/Airlytics.git</code>
3. Install NPM packages
<code>npm install</code>
4. create a `.env` file in root folder and add your API keys, as showcased in `.env.example`
```
AQICN_KEY='YOUR KEY HERE'
NEWS_KEY='YOUR KEY HERE'
GOOGLE_KEY='YOUR KEY HERE'
OPENWEATHER_KEY='YOUR KEY HERE'
```

## Contributing
1. Fork the project
2. Create your Feature Branch (`git checkout -b feature/yourFeature`)
3. Commit your Changes (`git commit -m 'add some changes'`)
4. Push to the Branch (`git push origin feature/yourFeature`)
5. Open a Pull Request

## Demo
Visit the website <a href="https://airlytics.altervista.org/" target="_blank">here</a>.

## License 
Distributed under the MIT License.

## Contact
<a href="https://www.andreadelorenzis.com/" target="_blank">andreadelorenzis.com</a> - andreadelorenzis99@gmail.com
