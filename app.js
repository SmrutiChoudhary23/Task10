import { fetchCurrentWeather, fetchForecast, testBackendConnection } from './api.js';
import { favoritesStorage, themeStorage, lastCityStorage } from './storage.js';
const elements = {
    themeToggle: document.getElementById('themeToggle'),
    themeText: document.getElementById('themeText'),
    
    favoritesList: document.getElementById('favoritesList'),
    
    connectionStatus: document.getElementById('connectionStatus'),
    connectionMessage: document.getElementById('connectionMessage'),
    
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('errorMessage'),
    currentWeather: document.getElementById('currentWeather'),
    forecast: document.getElementById('forecast'),
    forecastContainer: document.getElementById('forecastContainer'),
    favoriteBtn: document.getElementById('favoriteBtn'),
    
    cityName: document.getElementById('cityName'),
    weatherDesc: document.getElementById('weatherDesc'),
    weatherIcon: document.getElementById('weatherIcon'),
    temperature: document.getElementById('temperature'),
    feelsLike: document.getElementById('feelsLike'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('windSpeed'),
    pressure: document.getElementById('pressure')
};

let currentCity = lastCityStorage.getLastCity();
let currentWeatherData = null;

function showLoading() {
    elements.loading.classList.remove('hidden');
    elements.currentWeather.classList.add('hidden');
    elements.forecast.classList.add('hidden');
    elements.errorMessage.classList.add('hidden');
}

function hideLoading() {
    elements.loading.classList.add('hidden');
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.remove('hidden');
    elements.currentWeather.classList.add('hidden');
    elements.forecast.classList.add('hidden');
    hideLoading();
}

function updateConnectionUI(isConnected, message = '') {
    if (isConnected) {
        elements.connectionStatus.textContent = '● Connected to server';
        elements.connectionStatus.classList.add('connected');
        elements.connectionStatus.classList.remove('error');
        
        if (message) {
            elements.connectionMessage.textContent = message;
            elements.connectionMessage.className = 'connection-message success';
        }
    } else {
        elements.connectionStatus.textContent = '● Connection failed';
        elements.connectionStatus.classList.add('error');
        elements.connectionStatus.classList.remove('connected');
        
        elements.connectionMessage.textContent = message || 'Cannot connect to backend. Make sure server is running.';
        elements.connectionMessage.className = 'connection-message error';
    }
}

function displayCurrentWeather(data) {
    currentWeatherData = data;
    
    elements.cityName.textContent = `${data.name}, ${data.sys.country}`;
    elements.weatherDesc.textContent = data.weather[0].description;
    elements.weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    elements.temperature.textContent = Math.round(data.main.temp);
    elements.feelsLike.textContent = Math.round(data.main.feels_like);
    elements.humidity.textContent = data.main.humidity;
    elements.windSpeed.textContent = data.wind.speed.toFixed(1);
    elements.pressure.textContent = data.main.pressure;
    
    updateFavoriteButton(data.name);
    elements.currentWeather.classList.remove('hidden');
}

function displayForecast(forecastData) {
    if (!forecastData || forecastData.length === 0) return;
    
    elements.forecastContainer.innerHTML = forecastData.map(day => `
        <div class="forecast-card">
            <div class="forecast-date">${day.date}</div>
            <img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="${day.description}">
            <div class="forecast-temp">${Math.round(day.temp)}</div>
            <div class="forecast-desc">${day.description}</div>
            <div class="forecast-humidity">💧 ${day.humidity}%</div>
        </div>
    `).join('');
    
    elements.forecast.classList.remove('hidden');
}


async function loadWeatherData(city) {
    if (!city) return;
    
    showLoading();
    currentCity = city;
    
    try {
        const [weatherData, forecastData] = await Promise.all([
            fetchCurrentWeather(city),
            fetchForecast(city)
        ]);
        
        displayCurrentWeather(weatherData);
        displayForecast(forecastData);
        lastCityStorage.setLastCity(city);
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function renderFavorites() {
    const favorites = favoritesStorage.getFavorites();
    
    if (favorites.length === 0) {
        elements.favoritesList.innerHTML = '<p class="empty-fav">No favorites yet</p>';
        return;
    }
    
    elements.favoritesList.innerHTML = favorites.map(city => `
        <div class="favorite-item">
            <span class="favorite-city" onclick="window.loadCity('${city}')">${city}</span>
            <span class="remove-fav" onclick="window.removeFavorite('${city}')">✕</span>
        </div>
    `).join('');
}

function updateFavoriteButton(city) {
    const isFavorite = favoritesStorage.isFavorite(city);
    elements.favoriteBtn.innerHTML = isFavorite ? 
        '<span class="star">★</span> Remove from favorites' : 
        '<span class="star">☆</span> Add to favorites';
    elements.favoriteBtn.classList.toggle('active', isFavorite);
}

window.loadCity = function(city) {
    elements.cityInput.value = city;
    loadWeatherData(city);
};

window.removeFavorite = function(city) {
    favoritesStorage.removeFavorite(city);
    renderFavorites();
    if (currentWeatherData && currentWeatherData.name === city) {
        updateFavoriteButton(city);
    }
};

function toggleFavorite() {
    if (!currentWeatherData) return;
    
    const city = currentWeatherData.name;
    const isFavorite = favoritesStorage.isFavorite(city);
    
    if (isFavorite) {
        favoritesStorage.removeFavorite(city);
    } else {
        favoritesStorage.addFavorite(city);
    }
    
    updateFavoriteButton(city);
    renderFavorites();
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeStorage.setTheme(isDark ? 'dark' : 'light');
    
    const lightIcon = document.querySelector('.light-icon');
    const darkIcon = document.querySelector('.dark-icon');
    const themeText = document.getElementById('themeText');
    
    if (isDark) {
        lightIcon.style.display = 'none';
        darkIcon.style.display = 'inline';
        themeText.textContent = 'Dark';
    } else {
        lightIcon.style.display = 'inline';
        darkIcon.style.display = 'none';
        themeText.textContent = 'Light';
    }
}

function initializeTheme() {
    const savedTheme = themeStorage.getTheme();
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.querySelector('.light-icon').style.display = 'none';
        document.querySelector('.dark-icon').style.display = 'inline';
        elements.themeText.textContent = 'Dark';
    }
}

function getLocationWeather() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }
    
    showLoading();
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            showError('Location feature needs backend update. Please search by city name.');
            hideLoading();
        },
        (error) => {
            let message = 'Failed to get location';
            if (error.code === 1) message = 'Please allow location access';
            showError(message);
        }
    );
}

async function initializeApp() {
    const connection = await testBackendConnection();
    updateConnectionUI(connection.success, connection.success ? 'Connected to weather server' : connection.error);
    
    initializeTheme();
    
    renderFavorites();
    
    elements.cityInput.value = currentCity;
    loadWeatherData(currentCity);
    
    elements.searchBtn.addEventListener('click', () => {
        const city = elements.cityInput.value.trim();
        if (city) loadWeatherData(city);
    });
    
    elements.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = elements.cityInput.value.trim();
            if (city) loadWeatherData(city);
        }
    });
    
    elements.locationBtn.addEventListener('click', getLocationWeather);
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.favoriteBtn.addEventListener('click', toggleFavorite);
}
initializeApp();