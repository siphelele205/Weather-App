const API_KEY = "8f7f7061dac6a2db687723a8e54765c8"
const BASE_URL = "https://api.openweathermap.org/data/2.5"

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const locationElement = document.getElementById("location");
const dateElement = document.getElementById("date");
const tempElement = document.getElementById("temp");
const conditionElement = document.getElementById("condition");
const weatherIconElement = document.getElementById("weather-icon");
const feelsLikeElement = document.getElementById("feels-like");
const humidityElement = document.getElementById("humidity");
const windElement = document.getElementById("wind");
// const forecastElement = document.getElementById("forecast"); // Forecast HTML is not yet in index.html
const forecastElement = document.getElementById("forecast");

document.addEventListener("DOMContentLoaded", () => {
    getLocationWeather();
});

searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherByCity(city);
    }
});

locationBtn.addEventListener("click", getLocationWeather);

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter"){
        const city = cityInput.value.trim();
        if (city) {
            getWeatherByCity(city);
        }
    }
});

const loadingElement = document.getElementById("loading");

function showLoading() {
    loadingElement.style.display = "flex";
}

function hideLoading() {
    loadingElement.style.display = "none";
}

function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
};
    dateElement.textContent = now.toLocaleDateString("en-ZA", options);
}


async function getWeatherByCity(city) {
    showLoading();
    try {
        const currentResponse = await fetch(`${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`);
        const currentData = await currentResponse.json();

        if (currentData.cod !== 200) {
            throw new Error(currentData.message);
        }
        const forecastResponse = await fetch(`${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`);
        const forecastData = await forecastResponse.json();

        updateWeatherUI(currentData, forecastData);
    } catch (error) {
        alert(`Error: ${error.message}`);
        hideLoading();
    }
}    
async function getLocationWeather(){
    showLoading();
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(async(position) =>{
            const { latitude, longitude } = position.coords;
            try {
                const currentResponse = await fetch(`${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`);
                const currentData = await currentResponse.json();

                const forecastResponse = await fetch(`${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`);
                const forecastData = await forecastResponse.json();

                updateWeatherUI(currentData, forecastData);
            } catch (error) {
                alert(`Error fetching weather by location: ${error.message}`);
                hideLoading();
            }
        },
        (error) => {
            alert(`Error getting location: ${error.message}. Defaulting to Durban.`);
            getWeatherByCity('Durban');
        });
    } else {
        alert('Geolocation is not supported by this browser. Defaulting to Durban.');
        getWeatherByCity('Durban');
    }
}

function updateWeatherUI(currentData, forecastData) {
    locationElement.textContent = `${currentData.name}, ${currentData.sys.country}`;
    tempElement.innerHTML = `${Math.round(currentData.main.temp)}&deg;C`;
    conditionElement.textContent = currentData.weather[0].main;
    weatherIconElement.src = `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`;
    weatherIconElement.alt = currentData.weather[0].description;

    // The HTML file uses spans inside divs with a class of 'detail'. The innerHTML needs to be set on the span.
    document.querySelector("#feels-like").innerHTML = `Feels like: ${Math.round(currentData.main.feels_like)}&deg;C`;
    document.querySelector("#humidity").innerHTML = `Humidity: ${currentData.main.humidity}%`;
    // OpenWeatherMap wind speed is in meter/sec by default with units=metric. To get km/h, multiply by 3.6.
    document.querySelector("#wind").innerHTML = `Wind: ${Math.round(currentData.wind.speed * 3.6)} km/h`;

    updateDateTime();
    updateForecast(forecastData);
    hideLoading();
    cityInput.value = ""; // Clear input field
}

function updateForecast(forecastData) {
    const dailyForecast = {};
    forecastData.list.forEach((item) => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyForecast[date]) {
            dailyForecast[date] = [];
        }
        dailyForecast[date].push(item);
    });

    }

    const forecastDays = Object.keys(dailyForecast).slice(1, 6);

    forecastElement.innerHTML = '';

    forecastDays.forEach((day) => {
        const dayData = dailyForecast[day];
        const dayName = new Date(day).toLocaleDateString('en-ZA', { weekday: 'short' });
        const dayTemp = dayData.reduce((acc, item) => acc + item.main.temp, 0) / dayData.length;
        const dayHigh = Math.max(...dayData.map((item) => item.main.temp_max));
        const dayLow = Math.min(...dayData.map((item) => item.main.temp_min));
        const dayIcon = dayData[Math.floor(dayData.length / 2)].weather[0].icon;

       const forecastItem = document.createElement('div');
       forecastItem.className = "forecast-item";
       forecastItem.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">
            <img src="https://openweathermap.org/img/wn/${dayIcon}.png" alt="${dayData[0].weather[0].main}">
            </div>
            <div class="forecast-temp">
            <span class="forecast-high">${Math.round(dayHigh)}°</span>
            <span class="forecast-low">${Math.round(dayLow)}°</span>
            </div>
       `;
       forecastElement.appendChild(forecastItem);
    });
            

            


        

        

        











    

    
