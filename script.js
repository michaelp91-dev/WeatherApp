// Get references to the HTML elements
const getWeatherBtn = document.getElementById('getWeatherBtn');
const weatherInfo = document.getElementById('weather-info');
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const weatherIcon = document.getElementById('weather-icon');
const errorMessage = document.getElementById('error-message');
const apiResponseContainer = document.getElementById('api-response');

// Make sure to use your new student API key here.
const apiKey = 'YOUR_API_KEY';

// Add event listener to the button
getWeatherBtn.addEventListener('click', () => {
    // Clear previous results and show initial status
    apiResponseContainer.textContent = 'Fetching location...';
    weatherInfo.classList.add('hidden');
    errorMessage.classList.add('hidden');

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
    
    // 1. Print the coordinates first
    apiResponseContainer.textContent = `Location Found:\nLat: ${latitude}\nLon: ${longitude}`;
    
    getWeatherByCoords(latitude, longitude);
}

// Callback function for geolocation errors
function onError(error) {
    showError(`Could not get location: ${error.message}`);
}

// Function to fetch weather data from the API using coordinates
async function getWeatherByCoords(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    // Create a censored version of the URL to display
    const censoredApiUrl = apiUrl.replace(apiKey, 'API_KEY_HIDDEN');
    
    // 2. Append the censored API call to the output
    apiResponseContainer.textContent += `\n\nMaking API Call:\n${censoredApiUrl}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json(); 

        // 3. Append the final API response
        apiResponseContainer.textContent += `\n\nAPI Response:\n${JSON.stringify(data, null, 2)}`;

        if (!response.ok) {
            throw new Error(data.message || 'Weather data not found.');
        }
        
        displayWeather(data);
    } catch (error) {
        showError(error.message);
    }
}

// Function to display the fetched weather data
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

// Function to show an error message
function showError(message) {
    weatherInfo.classList.add('hidden');
    errorMessage.classList.remove('hidden');
    errorMessage.textContent = `Error: ${message}`;
    
    // Append the error to the log as well
    apiResponseContainer.textContent += `\n\nError:\n${message}`;
}
