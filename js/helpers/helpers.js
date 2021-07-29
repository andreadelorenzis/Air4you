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

export { calculateAQI, mapAQItoHealthData };