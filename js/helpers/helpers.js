import maskOrange from "../../img/mask-orange.png";
import maskRed from "../../img/mask-red.png";
import maskViolet from "../../img/mask-violet.png";
import maskMagenta from "../../img/mask-magenta.png";
import bikeGreen from "../../img/bike-green.png";
import bikeYellow from "../../img/bike-yellow.png";
import bikeOrange from "../../img/bike-orange.png";
import bikeRed from "../../img/bike-red.png";
import bikeViolet from "../../img/bike-violet.png";
import bikeMagenta from "../../img/bike-magenta.png";
import emojiGreen from "../../img/emoji-green.png";
import emojiYellow from "../../img/emoji-yellow.png";
import emojiOrange from "../../img/emoji-orange.png";
import emojiRed from "../../img/emoji-red.png";
import emojiViolet from "../../img/emoji-violet.png";
import emojiMagenta from "../../img/emoji-magenta.png";
import markerGreen from "../../img/marker-green.png";
import markerYellow from "../../img/marker-yellow.png";
import markerOrange from "../../img/marker-orange.png";
import markerRed from "../../img/marker-red.png";
import markerViolet from "../../img/marker-violet.png";
import markerMagenta from "../../img/marker-magenta.png";
import purifierOrange from "../../img/purifier-orange.png";
import purifierRed from "../../img/purifier-red.png";
import purifierViolet from "../../img/purifier-violet.png";
import purifierMagenta from "../../img/purifier-magenta.png";
import windowGreen from "../../img/window-green.png";
import windowYellow from "../../img/window-yellow.png";
import windowOrange from "../../img/window-orange.png";
import windowRed from "../../img/window-red.png";
import windowViolet from "../../img/window-violet.png";
import windowMagenta from "../../img/window-magenta.png";

/* take the AQI and maps it to an object with specific data, like colors and images */
function mapAQItoHealthData(aqi) {

    if (aqi == -1)
        return {
            level: 'n/a',
            firstColor: '#fff',
            secondColor: '#fff',
            thirdColor: '#fff',
            gradient: '#fff',
            recommendations: [],
            markerImg: '',
            emoji: ''
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
                    img: windowGreen
                },
                {
                    text: 'Enjoy outdoor activities',
                    img: bikeGreen
                }
            ],
            markerImg: markerGreen,
            emoji: emojiGreen
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
                    img: windowYellow
                },
                {
                    text: 'Sensitive groups should reduce outdoor exercise',
                    img: bikeYellow
                }
            ],
            markerImg: markerYellow,
            emoji: emojiYellow
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
                    img: windowOrange
                },
                {
                    text: 'Everyone should reduce outdoor exercise',
                    img: bikeOrange
                },
                {
                    text: 'Sensitive groups should wear a mask outdoors',
                    img: maskOrange
                },
                {
                    text: 'Could run an air purifier',
                    img: purifierOrange
                }
            ],
            markerImg: markerOrange,
            emoji: emojiOrange
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
                    img: windowRed
                },
                {
                    text: 'Avoid outdoor exercise',
                    img: bikeRed
                },
                {
                    text: 'Wear a mask outdoor',
                    img: maskRed
                },
                {
                    text: 'Run an air purifier',
                    img: purifierRed
                }
            ],
            markerImg: markerRed,
            emoji: emojiRed
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
                    img: windowViolet
                },
                {
                    text: 'Avoid outdoor exercise',
                    img: bikeViolet
                },
                {
                    text: 'Wear a mask outdoor',
                    img: maskViolet
                },
                {
                    text: 'Run an air purifier',
                    img: purifierViolet
                }
            ],
            markerImg: markerViolet,
            emoji: emojiViolet
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
                    img: windowMagenta
                },
                {
                    text: 'Avoid outdoor exercise',
                    img: bikeMagenta
                },
                {
                    text: 'Wear a mask outdoor',
                    img: maskMagenta
                },
                {
                    text: 'Run an air purifier',
                    img: purifierMagenta
                }
            ],
            markerImg: markerMagenta,
            emoji: emojiMagenta
        }
}

/* calculate AQI given a pm25 or pm10 value, with ug/m3 as unit measure */
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

    /* if the value is greater than 500, set the AQI to 500 */
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

    /* apply the formula for AQI calculation */
    let AQI = (IH - IL) / (BPH - BPL) * (value - BPL) + IL;
    if (!AQI) {
        return -1;
    }

    return AQI;
}

export { calculateAQI, mapAQItoHealthData };