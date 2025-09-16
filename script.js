body {
    font-family: Arial, sans-serif;
    background-color: #f0f8ff;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}

.weather-container {
    background-color: white;
    padding: 20px 30px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: 300px;
}

h1 {
    color: #333;
}

#getWeatherBtn {
    width: 100%;
    padding: 12px;
    border: none;
    background-color: #007BFF;
    color: white;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    margin-bottom: 20px;
}

#getWeatherBtn:hover {
    background-color: #0056b3;
}

#weather-info {
    margin-top: 20px;
}

#weather-icon {
    width: 100px;
    height: 100px;
}

.hidden {
    display: none;
}

#error-message {
    color: red;
    margin-top: 10px;
}
