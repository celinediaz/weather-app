const celcius = document.getElementById('celcius');
const far = document.getElementById('farenheit');
const input = document.getElementById('input-search');
let currentCity = "London", unit = "metric";

// create DOM for the hourly weather
(function hourlyWeather() {
    const lower = document.getElementById('lower');
    for (let i = 0; i < 5; i++) {
        lower.innerHTML = lower.innerHTML + 
        `<div class="hourly-temp" data-index="${i}">
            <p class="hour"></p>
            <img class="icon">
            <p class="pop"></p>
            <p class="status"></p>
            <p class="temperature"></p>
        </div>`;
    }
})();
/**
 * Shows the date according to the location's timezone
 * @param {string} timezone 
 */
function dateByTimeZone(timezone) {
    let today = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
    return {
        hour: today.getHours(),
        weekday: today.toLocaleString('en-us', { weekday: 'long' }),
        time: today.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })
    }
}
/**
 * Sets the location info in the DOM and stores the city in a global variable so
 * even if the user submits a wrong location you still have a location to work with.
 * @param {string} cityName 
 * @param {string} country 
 */
 function setLocation(cityName, country) {
    const city = document.getElementById('city');
    currentCity = cityName;
    city.textContent = `${currentCity}, ${country}`;
}
/**
 * Sets the weather information in the DOM
 * @param {Array} hourlyArr 
 * @param {Object} today 
 */
function setWeatherInfo(hourlyArr, today) {
    const divs = document.querySelectorAll(".hourly-temp");
    const day = document.querySelector("#day");
    const desc = document.querySelector("#desc");
    const temp = document.getElementById('current-temp')
    console.log(hourlyArr)
    day.textContent = `${today.weekday}, ${today.time}`;
    desc.textContent = `${hourlyArr[0].weather[0].description}`
    temp.textContent = `${hourlyArr[0].temp}º`
    divs.forEach((container, index) => {
        container.children[0].textContent = `${today.hour++}:00`;
        const img = container.children[1];
        img.src = `img/${hourlyArr[index].weather[0].icon}.svg`
        container.children[2].textContent = `${(hourlyArr[index].pop * 100).toFixed()}%`;
        container.children[3].textContent = `${hourlyArr[index].weather[0].description}`;
        container.children[4].textContent = `${hourlyArr[index].temp}º`;
    })
}
/**
 * Fetches the coordinates, the city's name, and the country of the selected city.
 * @param {string} city 
 */
async function fetchCoordsAndCity(city) {
    let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&APPID=e83bb5d054ff75fd497fd14eb14194c0`, { mode: 'cors' })
    let json = await response.json();
    return {
        lon: json.coord.lon,
        lat: json.coord.lat,
        name: json.name,
        country: json.sys.country
    }
}
/**
 * Uses the coordinates to search the hourly weather information and sets the weather's information and the location in the DOM.
 * @param {number} lon 
 * @param {number} lat 
 * @param {string} units 
 * @param {string} city 
 * @param {string} country 
 */
async function fetchHourlyInfo(lon, lat, units, city, country) {
    let response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=daily,minutely,alerts&units=${units}&appid=e83bb5d054ff75fd497fd14eb14194c0`, { mode: 'cors' })
    let json = await response.json();
    const today = dateByTimeZone(json.timezone);
    setLocation(city, country);
    setWeatherInfo(json.hourly, today)
}
/**
 * Fetches the location and uses it to fetch the weather's info.
 * @param {string} city 
 */
function loadWeather(city){
    fetchCoordsAndCity(city)
    .then((json) => fetchHourlyInfo(json.lon, json.lat, unit, json.name, json.country))
    .catch(() => alert("incorrect city"));
}

document.getElementById('search-btn').addEventListener('click', function () {
    let city = input.value;
    loadWeather(city);    
});

input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {  //checks whether the pressed key is "Enter"
        let city = input.value;
        loadWeather(city);
    }
});

celcius.addEventListener('click', function () {
    unit = "metric";
    loadWeather(currentCity);
    celcius.classList.add('selected-temp');
    far.classList.remove('selected-temp');
});

far.addEventListener('click', function () {
    unit = "imperial";
    loadWeather(currentCity);
    far.classList.add('selected-temp');
    celcius.classList.remove('selected-temp');
});

loadWeather(currentCity)
