const apiKey = 'API_KEY_PLACEHOLDER';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

const locationInput = document.getElementById('locationInput');
const searchButton = document.getElementById('searchButton');
const locationElement = document.getElementById('location');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');
const weatherIcon = document.getElementById('weather-icon');

// References to the details display elements
const detailsContainer = document.getElementById('details-container');
const apiResponseContainer = document.getElementById('api-response');

searchButton.addEventListener('click', () => {
    const location = locationInput.value;
    if (location) {
        fetchWeather(location);
    }
});

locationInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        const location = locationInput.value;
        if (location) {
            fetchWeather(location);
        }
    }
});

async function fetchWeather(location) {
    const url = `${apiUrl}?q=${location}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'City not found.');
        }
        const data = await response.json();

        // Display basic weather info
        locationElement.textContent = data.name;
        temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
        descriptionElement.textContent = data.weather[0].description;
        weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        weatherIcon.alt = data.weather[0].description;

        // Display the full JSON response in the details section
        apiResponseContainer.textContent = JSON.stringify(data, null, 2);
        detailsContainer.classList.remove('hidden'); // Show the details container

    } catch (error) {
        console.error('Error fetching weather data:', error);
        locationElement.textContent = error.message;
        temperatureElement.textContent = '';
        descriptionElement.textContent = '';
        weatherIcon.src = '';
        detailsContainer.classList.add('hidden'); // Hide details on error
    }
}
