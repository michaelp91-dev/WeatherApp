document.addEventListener('DOMContentLoaded', () => {

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

    // Reference for the daily detail display
    const dailyDetailDisplay = document.getElementById('daily-detail-display');

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

            updateAllWeatherDisplays(currentData, hourlyData, dailyData);

        } catch (error) {
            showError(error.message);
        }
    }

    function updateAllWeatherDisplays(currentData, hourlyData, dailyData) {
        errorMessage.textContent = '';
        weatherDisplay.classList.remove('hidden');

        // Update current weather display
        locationElement.textContent = currentData.name;
        temperatureElement.textContent = `${Math.round(currentData.main.temp)}°F`;
        descriptionElement.textContent = currentData.weather[0].description;
        weatherIcon.src = `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`;
        
        feelsLike.textContent = `${Math.round(currentData.main.feels_like)}°F`;
        highLow.textContent = `${Math.round(dailyData.list[0].temp.max)}°F / ${Math.round(dailyData.list[0].temp.min)}°F`;
        humidity.textContent = `${currentData.main.humidity}%`;
        wind.textContent = `${Math.round(currentData.wind.speed)} mph`;
        pressure.textContent = `${currentData.main.pressure} hPa`;
        visibility.textContent = `${(currentData.visibility / 1609).toFixed(1)} mi`;
        
        sunrise.textContent = new Date(currentData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        sunset.textContent = new Date(currentData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Update hourly forecast display
        hourlyForecastContainer.innerHTML = '';
        const hourlyForecasts = hourlyData.list.slice(0, 24);

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

        // Update daily forecast display & add click listener
        dailyForecastContainer.innerHTML = '';

        dailyData.list.forEach((day, index) => {
            const date = new Date(day.dt * 1000);
            const fullDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const highTemp = Math.round(day.temp.max);
            const lowTemp = Math.round(day.temp.min);
            const iconSrc = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
            const description = day.weather[0].description;

            const dailyItem = document.createElement('div');
            dailyItem.classList.add('daily-item');
            dailyItem.innerHTML = `
                <p class="day-name">${fullDate}</p>
                <img src="${iconSrc}" alt="${description}">
                <p class="temp-range">${highTemp}°F / ${lowTemp}°F</p>
            `;

            dailyItem.addEventListener('click', () => {
                displayDailyDetails(day);
            });

            dailyForecastContainer.appendChild(dailyItem);
        });
    }

    // NEW: Function to display detailed information for a selected day
    function displayDailyDetails(dayData) {
        if (!dailyDetailDisplay.classList.contains('hidden') && dailyDetailDisplay.dataset.dt === dayData.dt) {
            dailyDetailDisplay.classList.add('hidden');
            delete dailyDetailDisplay.dataset.dt;
            return;
        }

        dailyDetailDisplay.dataset.dt = dayData.dt;

        const date = new Date(dayData.dt * 1000);
        const fullDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const sunriseTime = new Date(dayData.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const sunsetTime = new Date(dayData.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const rainAmount = dayData.rain ? (dayData.rain / 25.4).toFixed(2) : '0';

        dailyDetailDisplay.innerHTML = `
            <h4>${fullDate}</h4>
            <div class="daily-detail-grid">
                <div class="detail-item">
                    <span class="label">Weather</span>
                    <span class="value">${dayData.weather[0].description}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Day Temp</span>
                    <span class="value">${Math.round(dayData.temp.day)}°F</span>
                </div>
                <div class="detail-item">
                    <span class="label">Night Temp</span>
                    <span class="value">${Math.round(dayData.temp.night)}°F</span>
                </div>
                <div class="detail-item">
                    <span class="label">Feels Like</span>
                    <span class="value">${Math.round(dayData.feels_like.day)}°F</span>
                </div>
                <div class="detail-item">
                    <span class="label">Humidity</span>
                    <span class="value">${dayData.humidity}%</span>
                </div>
                <div class="detail-item">
                    <span class="label">Wind Speed</span>
                    <span class="value">${Math.round(dayData.speed)} mph</span>
                </div>
                <div class="detail-item">
                    <span class="label">Gust Speed</span>
                    <span class="value">${Math.round(dayData.gust)} mph</span>
                </div>
                <div class="detail-item">
                    <span class="label">Cloudiness</span>
                    <span class="value">${dayData.clouds}%</span>
                </div>
                <div class="detail-item">
                    <span class="label">Precipitation Chance</span>
                    <span class="value">${Math.round(dayData.pop * 100)}%</span>
                </div>
                <div class="detail-item">
                    <span class="label">Rainfall</span>
                    <span class="value">${rainAmount} in</span>
                </div>
                <div class="detail-item">
                    <span class="label">Pressure</span>
                    <span class="value">${dayData.pressure} hPa</span>
                </div>
                <div class="detail-item">
                    <span class="label">Sunrise</span>
                    <span class="value">${sunriseTime}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Sunset</span>
                    <span class="value">${sunsetTime}</span>
                </div>
            </div>
        `;
        dailyDetailDisplay.classList.remove('hidden');
    }

    function showError(message) {
        weatherDisplay.classList.add('hidden');
        hourlyForecastContainer.innerHTML = '';
        dailyForecastContainer.innerHTML = '';
        dailyDetailDisplay.classList.add('hidden');
        errorMessage.textContent = `Error: ${message}`;
    }

});
