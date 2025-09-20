const apiKey = 'API_KEY_PLACEHOLDER';
const currentApiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const hourlyApiUrl = 'https://pro.openweathermap.org/data/2.5/forecast/hourly';

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

// New references for hourly forecast and raw data
const hourlyForecastContainer = document.getElementById('hourly-forecast-container');
const rawDataDisplay = document.getElementById('rawDataDisplay');
const hourlyRawDataDisplay = document.getElementById('hourlyRawDataDisplay');

getWeatherBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    } else {
        showError("Geolocation is not supported by your browser.");
    }
});

function onSuccess(position) {
    const { latitude, longitude } = position.coords;
    fetchWeatherAndForecast(latitude, longitude);
}

function onError(error) {
    showError(`Could not get location: ${error.message}`);
}

async function fetchWeatherAndForecast(lat, lon) {
    const currentUrl = `${currentApiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    const hourlyUrl = `${hourlyApiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

    try {
        const [currentResponse, hourlyResponse] = await Promise.all([
            fetch(currentUrl),
            fetch(hourlyUrl)
        ]);

        if (!currentResponse.ok) {
            const data = await currentResponse.json();
            throw new Error(data.message || 'Current weather data not found.');
        }

        if (!hourlyResponse.ok) {
            const data = await hourlyResponse.json();
            throw new Error(data.message || 'Hourly forecast data not found.');
        }

        const currentData = await currentResponse.json();
        const hourlyData = await hourlyResponse.json();

        // Display raw data for both API calls
        rawDataDisplay.textContent = JSON.stringify(currentData, null, 2);
        hourlyRawDataDisplay.textContent = JSON.stringify(hourlyData, null, 2);

        // Call functions to display the processed weather data
        displayWeather(currentData);
        displayHourlyWeather(hourlyData);

    } catch (error) {
        showError(error.message);
    }
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
    hourlyForecastContainer.innerHTML = ''; // Clear previous content

    // We'll display the next 8 hours for simplicity
    const hourlyForecasts = data.list.slice(0, 8);

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

function showError(message) {
    weatherDisplay.classList.add('hidden');
    hourlyForecastContainer.innerHTML = ''; // Clear hourly forecast on error
    rawDataDisplay.textContent = ''; // Clear raw data on error
    hourlyRawDataDisplay.textContent = ''; // Clear hourly raw data on error
    errorMessage.textContent = `Error: ${message}`;
}
