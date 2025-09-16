// Get references to the HTML elements
const getWeatherBtn = document.getElementById('getWeatherBtn');
const weatherInfo = document.getElementById('weather-info');
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const weatherIcon = document.getElementById('weather-icon');
const errorMessage = document.getElementById('error-message');

// The placeholder will be replaced by our deployment script
const apiKey = 'API_KEY_PLACEHOLDER';

// Add event listener to the button
getWeatherBtn.addEventListener('click', () => {
    // Use the Geolocation API to get the user's position
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    } else {
        showError("Geolocation is not supported by this browser.");
    }
});

// Callback function for successful geolocation
function onSuccess(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Fetch weather data using the coordinates
    getWeatherByCoords(latitude, longitude);
}

// Callback function for geolocation errors
function onError(error) {
    showError(`Could not get location: ${error.message}`);
}

// Function to fetch weather data from the API using coordinates
async function getWeatherByCoords(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Weather data not found.');
        }
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        showError(error.message);
    }
}

// Function to display the fetched weather data (this function is unchanged)
function displayWeather(data) {
    errorMessage.classList.add('hidden');
    weatherInfo.classList.remove('hidden');

    cityName.textContent = data.name;
    temperature.textContent = `Temperature: ${Math.round(data.main.temp)}°C`;
    description.textContent = `Weather: ${data.weather[0].main}`;
    
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
}

// Function to show an error message (this function is unchanged)
function showError(message) {
    weatherInfo.classList.add('hidden');
    errorMessage.classList.remove('hidden');
    errorMessage.textContent = `Error: ${message}`;
}
