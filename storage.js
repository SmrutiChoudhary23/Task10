const STORAGE_KEYS = {
    FAVORITES: 'weather_favorites',
    THEME: 'weather_theme',
    LAST_CITY: 'weather_last_city'
};
function save(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}
function get(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}
export const favoritesStorage = {
    getFavorites: () => get(STORAGE_KEYS.FAVORITES, []),
    
    addFavorite: (city) => {
        const favorites = get(STORAGE_KEYS.FAVORITES, []);
        if (!favorites.includes(city)) {
            favorites.push(city);
            save(STORAGE_KEYS.FAVORITES, favorites);
        }
        return favorites;
    },  
    removeFavorite: (city) => {
        let favorites = get(STORAGE_KEYS.FAVORITES, []);
        favorites = favorites.filter(fav => fav !== city);
        save(STORAGE_KEYS.FAVORITES, favorites);
        return favorites;
    },
    
    isFavorite: (city) => {
        const favorites = get(STORAGE_KEYS.FAVORITES, []);
        return favorites.includes(city);
    }
};
export const themeStorage = {
    getTheme: () => get(STORAGE_KEYS.THEME, 'light'),
    setTheme: (theme) => save(STORAGE_KEYS.THEME, theme)
};
export const lastCityStorage = {
    getLastCity: () => get(STORAGE_KEYS.LAST_CITY, 'London'),
    setLastCity: (city) => save(STORAGE_KEYS.LAST_CITY, city)
};