const apiKey = 'c6bd4e2b18028570cfa5265a70eda238';
const currentApiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const hourlyApiUrl = 'https://pro.openweathermap.org/data/2.5/forecast/hourly';
const dailyApiUrl = 'https://api.openweathermap.org/data/2.5/forecast/daily';

// Get references to all HTML elements
const getWeatherBtn = document.getElementById('getWeatherBtn');
const weatherDisplay = document.getElementById('weather-display');
const errorMessage = document.getElementById('error-message');

const locationElement = document.getElementById('location');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');
const weatherIcon = document.getElementById('weather-icon');
const feelsLike = document.getElementById('feels-like');
const highLow = document.getElementById('high-low');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const pressure = document.getElementById('pressure');
const visibility = document.getElementById('visibility');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');

// References for hourly and daily forecast
const hourlyForecastContainer = document.getElementById('hourly-forecast-container');
const dailyForecastContainer = document.getElementById('daily-forecast-container');

// NEW: Global variable for the map
let map = null;

getWeatherBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    } else {
        showError("Geolocation is not supported by your browser.");
    }
});

function onSuccess(position) {
    const { latitude, longitude } = position.coords;
    fetchWeatherAndForecasts(latitude, longitude);
}

function onError(error) {
    showError(`Could not get location: ${error.message}`);
}

async function fetchWeatherAndForecasts(lat, lon) {
    const currentUrl = `${currentApiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    const hourlyUrl = `${hourlyApiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    const dailyUrl = `${dailyApiUrl}?lat=${lat}&lon=${lon}&cnt=7&appid=${apiKey}&units=imperial`;

    try {
        const [currentResponse, hourlyResponse, dailyResponse] = await Promise.all([
            fetch(currentUrl),
            fetch(hourlyUrl),
            fetch(dailyUrl)
        ]);

        if (!currentResponse.ok) {
            const data = await currentResponse.json();
            throw new Error(data.message || 'Current weather data not found.');
        }

        if (!hourlyResponse.ok) {
            const data = await hourlyResponse.json();
            throw new Error(data.message || 'Hourly forecast data not found.');
        }

        if (!dailyResponse.ok) {
            const data = await dailyResponse.json();
            throw new Error(data.message || 'Daily forecast data not found.');
        }

        const currentData = await currentResponse.json();
        const hourlyData = await hourlyResponse.json();
        const dailyData = await dailyResponse.json();

        // Call functions to display the processed weather data
        displayWeather(currentData);
        displayHourlyWeather(hourlyData);
        displayDailyWeather(dailyData);

        // NEW: Initialize and display the map
        initializeMap(lat, lon);

    } catch (error) {
        showError(error.message);
    }
}

// NEW: Function to initialize and display the map
function initializeMap(lat, lon) {
    // If a map already exists, remove it
    if (map) {
        map.remove();
    }
    
    // Create the new map centered on the user's location
    map = L.map('map').setView([lat, lon], 10);

    // Add a base map tile layer (OpenStreetMap)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // Add OpenWeatherMap overlays
    const cloudsLayer = L.tileLayer(`https://maps.openweathermap.org/maps/2.0/weather/CLOUDS_NEW/{z}/{x}/{y}?appid=${apiKey}`, {
        opacity: 0.5,
        attribution: '© OpenWeatherMap'
    });

    const temperatureLayer = L.tileLayer(`https://maps.openweathermap.org/maps/2.0/weather/temp_new/{z}/{x}/{y}?appid=${apiKey}`, {
        opacity: 0.5,
        attribution: '© OpenWeatherMap'
    });
    
    // Add layers to the map and create a layer control
    const baseLayers = {
        "OpenStreetMap": L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
    };
    
    const overlayLayers = {
        "Temperature": temperatureLayer,
        "Clouds": cloudsLayer
    };
    
    L.control.layers(baseLayers, overlayLayers).addTo(map);
    temperatureLayer.addTo(map);
}

function displayWeather(data) {
    errorMessage.textContent = '';
    
    locationElement.textContent = data.name;
    temperatureElement.textContent = `${Math.round(data.main.temp)}°F`;
    descriptionElement.textContent = data.weather[0].description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°F`;
    highLow.textContent = `${Math.round(data.main.temp_max)}°F / ${Math.round(data.main.temp_min)}°F`;
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${Math.round(data.wind.speed)} mph`;
    pressure.textContent = `${data.main.pressure} hPa`;
    visibility.textContent = `${(data.visibility / 1609).toFixed(1)} mi`;
    
    sunrise.textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    sunset.textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    weatherDisplay.classList.remove('hidden');
}

function displayHourlyWeather(data) {
    hourlyForecastContainer.innerHTML = '';
    const hourlyForecasts = data.list.slice(0, 24);

    hourlyForecasts.forEach(hour => {
        const date = new Date(hour.dt * 1000);
        const time = date.toLocaleTimeString([], { hour: 'numeric' });
        const temp = Math.round(hour.main.temp);
        const iconSrc = `https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`;
        const description = hour.weather[0].description;

        const hourlyItem = document.createElement('div');
        hourlyItem.classList.add('hourly-item');
        hourlyItem.innerHTML = `
            <p>${time}</p>
            <img src="${iconSrc}" alt="${description}">
            <p>${temp}°F</p>
        `;

        hourlyForecastContainer.appendChild(hourlyItem);
    });
}

function displayDailyWeather(data) {
    dailyForecastContainer.innerHTML = '';

    data.list.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const highTemp = Math.round(day.temp.max);
        const lowTemp = Math.round(day.temp.min);
        const iconSrc = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
        const description = day.weather[0].description;

        const dailyItem = document.createElement('div');
        dailyItem.classList.add('daily-item');
        dailyItem.innerHTML = `
            <p class="day-name">${dayName}</p>
            <img src="${iconSrc}" alt="${description}">
            <p class="temp-range">${highTemp}°F / ${lowTemp}°F</p>
        `;

        dailyForecastContainer.appendChild(dailyItem);
    });
}

function showError(message) {
    weatherDisplay.classList.add('hidden');
    hourlyForecastContainer.innerHTML = '';
    dailyForecastContainer.innerHTML = '';
    errorMessage.textContent = `Error: ${message}`;
}
