const apiKey = 'c6bd4e2b18028570cfa5265a70eda238';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

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

getWeatherBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        // This prompts the user for permission
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    } else {
        showError("Geolocation is not supported by your browser.");
    }
});

// This function runs if the user allows location access
function onSuccess(position) {
    const { latitude, longitude } = position.coords;
    fetchWeatherByCoords(latitude, longitude);
}

// This function runs if the user blocks location access or an error occurs
function onError(error) {
    showError(`Could not get location: ${error.message}`);
}

async function fetchWeatherByCoords(lat, lon) {
    // Build the URL with coordinates instead of a city name
    const url = `${apiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Weather data not found.');
        }
        const data = await response.json();

        // --- NEW CODE ADDED HERE ---
        const rawDataDisplay = document.getElementById('rawDataDisplay');
        if (rawDataDisplay) {
            rawDataDisplay.textContent = JSON.stringify(data, null, 2);
        }
        // --- END OF NEW CODE ---
        
        displayWeather(data);
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

function showError(message) {
    weatherDisplay.classList.add('hidden');
    errorMessage.textContent = `Error: ${message}`;
}
