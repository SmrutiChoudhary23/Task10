const API_KEY = 'fac8633f5a804cc7c60284ee925b552e';  

const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function fetchCurrentWeather(city) {
    if (!city || city.trim() === '') {
        throw new Error('Please enter a city name');
    }
    try {
        const response = await fetch(
            `${API_BASE_URL}/weather?q=${encodeURIComponent(city.trim())}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();   
        if (!response.ok) {
            throw new Error(data.message || 'City not found');
        } 
        return data;
    } catch (error) {
        throw new Error(error.message || 'Failed to fetch weather data');
    }
}
export async function fetchForecast(city) {
    if (!city || city.trim() === '') {
        throw new Error('Please enter a city name');
    }
    try {
        const response = await fetch(
            `${API_BASE_URL}/forecast?q=${encodeURIComponent(city.trim())}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Forecast not found');
        }
        const dailyForecast = [];
        for (let i = 0; i < data.list.length; i += 8) {
            if (dailyForecast.length < 5) {
                const item = data.list[i];
                dailyForecast.push({
                    date: new Date(item.dt * 1000).toLocaleDateString(),
                    temp: item.main.temp,
                    description: item.weather[0].description,
                    icon: item.weather[0].icon,
                    humidity: item.main.humidity
                });
            }
        }
        return dailyForecast;
    } catch (error) {
        throw new Error(error.message || 'Failed to fetch forecast');
    }
}
export async function testBackendConnection() {
    if (API_KEY === 'fac8633f5a804cc7c60284ee925b552e') {
        return { 
            success: false, 
            error: 'Please add your OpenWeatherMap API key in api.js' 
        };
    }
    return { success: true, message: 'API key configured' };
}