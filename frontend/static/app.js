const BASE_URL = 'http://127.0.0.1:8000';

// -------------------------
// WEATHER ICON MAPPING
// -------------------------
function getWeatherIcon(description) {
    description = description.toLowerCase();
    if (description.includes('rain') || description.includes('drizzle')) return '../images/rain.png';
    if (description.includes('cloud')) return '../images/cloudy.png';
    if (description.includes('clear') || description.includes('sun')) return '../images/sunny.png';
    if (description.includes('snow')) return '../images/cloudy.png';
    if (description.includes('thunder')) return '../images/rain.png';
    return '../images/cloudy.png';
}

// -------------------------
// TIMEZONE CONVERSION
// -------------------------
function convertToLocalTime(utcTimestamp, timezoneOffset) {
    const utcDate = new Date(utcTimestamp.replace(' ', 'T') + 'Z');
    const localTime = new Date(utcDate.getTime() + timezoneOffset * 1000);
    return localTime;
}

function formatTime(date) {
    return date.toISOString().substr(11, 5);
}

function formatDate(date) {
    return date.toISOString().substr(0, 10);
}

// -------------------------
// SAVED CITIES
// -------------------------
function getSavedCities() {
    const stored = localStorage.getItem('savedCities');
    return stored ? JSON.parse(stored) : [];
}

function saveCity(cityName) {
    let saved = getSavedCities();
    if (!saved.find(c => c.name.toLowerCase() === cityName.toLowerCase())) {
        saved.push({ name: cityName });
        localStorage.setItem('savedCities', JSON.stringify(saved));
    }
}

function unsaveCity(cityName) {
    let saved = getSavedCities();
    saved = saved.filter(c => c.name.toLowerCase() !== cityName.toLowerCase());
    localStorage.setItem('savedCities', JSON.stringify(saved));
}

function isCitySaved(cityName) {
    const saved = getSavedCities();
    return saved.some(c => c.name.toLowerCase() === cityName.toLowerCase());
}

function updateSaveBtn(cityName) {
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.textContent = isCitySaved(cityName) ? '★' : '☆';
    }
}

// -------------------------
// RECENT CITIES
// -------------------------
function getRecentCities() {
    const stored = localStorage.getItem('recentCities');
    return stored ? JSON.parse(stored) : [];
}

function addRecentCity(cityName) {
    let recent = getRecentCities();
    recent = recent.filter(c => c.name.toLowerCase() !== cityName.toLowerCase());
    recent.unshift({ name: cityName });
    if (recent.length > 5) recent = recent.slice(0, 5);
    localStorage.setItem('recentCities', JSON.stringify(recent));
}

// -------------------------
// FETCH CURRENT CITY WEATHER
// -------------------------
async function fetchCityWeather(cityName) {
    try {
        const response = await fetch(`${BASE_URL}/api/weather/${cityName}/`);
        const data = await response.json();

        if (data.error) return null;

        return {
            name: data.city,
            temp: data.temperature + '°C',
            status: data.description,
            feels: data.temperature + '°C',
            humidity: data.humidity,
            pressure: data.pressure,
            timezone: data.timezone
        };

    } catch (error) {
        console.error('City fetch failed:', error);
        return null;
    }
}

// -------------------------
// FETCH FORECAST
// -------------------------
async function fetchForecast(cityName) {
    try {
        const response = await fetch(`${BASE_URL}/api/forecast/${cityName}/`);
        const data = await response.json();

        if (data.error) return;

        const timezoneOffset = data.timezone;

        // HOURLY FORECAST
        const hourlyContainer = document.getElementById('hour-container');
        hourlyContainer.innerHTML = '';

        const next8 = data.forecasts.slice(0, 8);

        next8.forEach(item => {
            const localDate = convertToLocalTime(item.timestamp, timezoneOffset);
            const time = formatTime(localDate);

            const div = document.createElement('div');
            div.className = 'hour-item';
            div.innerHTML = `
                <p class="hour-time">${time}</p>
                <img class="hour-icon" src="${getWeatherIcon(item.description)}" alt="icon">
                <p class="hour-temp">${item.temperature}°C</p>
            `;
            hourlyContainer.appendChild(div);
        });

        // DAILY FORECAST
        const dailyData = {};

        data.forecasts.forEach(item => {
            const localDate = convertToLocalTime(item.timestamp, timezoneOffset);
            const date = formatDate(localDate);

            if (!dailyData[date]) {
                dailyData[date] = {
                    temps: [],
                    description: item.description
                };
            }
            dailyData[date].temps.push(item.temperature);
        });

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const days = Object.keys(dailyData);
        const forecastContainer = document.querySelector('.forecast');

        forecastContainer.style.gridTemplateColumns = `repeat(${days.length}, 1fr)`;

        const forecastItems = document.querySelectorAll('.forecast-day');

        forecastItems.forEach((item, index) => {
            if (days[index]) {
                const date = days[index];
                const avgTemp = (dailyData[date].temps.reduce((a, b) => a + b, 0) / dailyData[date].temps.length).toFixed(1);
                const desc = dailyData[date].description;
                const localDate = new Date(date + 'T00:00:00Z');
                const dayName = dayNames[localDate.getUTCDay()];

                item.querySelector('.day-name').innerText = dayName;
                item.querySelector('.day-temp').innerText = avgTemp + '°C';
                item.style.display = 'flex';

                const icon = item.querySelector('.day-icon');
                if (icon) icon.src = getWeatherIcon(desc);
            } else {
                item.style.display = 'none';
            }
        });

    } catch (error) {
        console.error('Forecast fetch failed:', error);
    }
}

// -------------------------
// FETCH SENSOR DATA FROM PI
// -------------------------
async function fetchSensorData() {
    try {
        const response = await fetch(`${BASE_URL}/api/weather/`);
        const data = await response.json();

        if (data.error) return;

        document.getElementById('temperature').innerText = data.temperature + ' °C';
        document.getElementById('humidity').innerText = data.humidity + ' %';
        document.getElementById('pressure').innerText = data.pressure + ' hPa';

    } catch (error) {
        console.error('Sensor fetch failed:', error);
    }
}

document.addEventListener('DOMContentLoaded', function () {

    const openBtn = document.getElementById('openCities');
    const closeBtn = document.getElementById('closeCities');
    const backBtn = document.getElementById('backBtn');
    const citySidebar = document.getElementById('citySidebar');
    const cityResults = document.getElementById('cityResults');
    const weatherBtn = document.getElementById('weatherBtn');
    const searchBar = document.getElementById('searchBar');
    const saveBtn = document.getElementById('saveBtn');

    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const closeSettings = document.getElementById('closeSettings');
    const themeToggle = document.getElementById('themeToggle');

    let currentCityName = 'London';

    function showCategories() {
        cityResults.innerHTML = '';
        backBtn.style.display = 'none';
        document.querySelectorAll('.city-section').forEach(section => {
            section.style.display = 'block';
        });
    }

    function updateWeather(city) {
        document.getElementById('location').innerText = city.name;
        document.getElementById('main_temp').innerText = city.temp;
        document.getElementById('weather_status').innerText = city.status;
        document.getElementById('feels_like').innerText = 'Feels like ' + city.feels;

        const mainIcon = document.getElementById('weather_icon');
        if (mainIcon) mainIcon.src = getWeatherIcon(city.status);

        currentCityName = city.name;
        updateSaveBtn(city.name);
    }

    // Save button toggle
    saveBtn.onclick = function () {
        if (isCitySaved(currentCityName)) {
            unsaveCity(currentCityName);
        } else {
            saveCity(currentCityName);
        }
        updateSaveBtn(currentCityName);
    };

    // Load London on startup
    fetchCityWeather('London').then(data => {
        if (data) updateWeather(data);
    });
    fetchForecast('London');

    fetchSensorData();
    setInterval(fetchSensorData, 5000);

    openBtn.onclick = function (e) {
        e.preventDefault();
        citySidebar.classList.add('active');
        showCategories();
    };

    closeBtn.onclick = function () {
        citySidebar.classList.remove('active');
        showCategories();
    };

    // Back button
    backBtn.onclick = function () {
        showCategories();
    };

    const cityGroups = {
        get saved() { return getSavedCities(); },
        popular: [{ name: 'London' }, { name: 'New York' }, { name: 'Paris' }, { name: 'Dubai' }, { name: 'Sydney' }],
        get recent() { return getRecentCities(); }
    };

    document.querySelectorAll('.menu-option').forEach(option => {
        option.onclick = function () {
            const group = this.dataset.group;
            cityResults.innerHTML = '';

            document.querySelectorAll('.city-section').forEach(section => {
                section.style.display = 'none';
            });

            // Show back button
            backBtn.style.display = 'inline-block';

            const cities = cityGroups[group];

            if (cities.length === 0) {
                const empty = document.createElement('p');
                empty.style.color = '#aaa';
                empty.style.padding = '10px';
                empty.innerText = group === 'saved' ? 'No saved cities yet' : 'No recent cities yet';
                cityResults.appendChild(empty);
                return;
            }

            cities.forEach(city => {
                const item = document.createElement('div');
                item.className = 'city-item';
                item.innerText = city.name;

                item.onclick = async function () {
                    const cityData = await fetchCityWeather(city.name);
                    if (cityData) {
                        updateWeather(cityData);
                        fetchForecast(city.name);
                    }

                    citySidebar.classList.remove('active');
                    showCategories();
                };

                cityResults.appendChild(item);
            });
        };
    });

    // Weather button - refresh to London
    weatherBtn.onclick = async function (e) {
        e.preventDefault();
        const cityData = await fetchCityWeather('London');
        if (cityData) {
            updateWeather(cityData);
            fetchForecast('London');
        }
    };

    searchBar.addEventListener('keydown', async function (e) {
        if (e.key === 'Enter') {
            const cityName = this.value.trim();
            if (cityName) {
                const cityData = await fetchCityWeather(cityName);
                if (cityData) {
                    updateWeather(cityData);
                    fetchForecast(cityName);
                    addRecentCity(cityName);
                }
            }
            this.value = '';
        }
    });

    if (settingsBtn) {
        settingsBtn.onclick = function (e) {
            e.preventDefault();
            settingsPanel.classList.add('active');
        };
    }

    if (closeSettings) {
        closeSettings.onclick = function () {
            settingsPanel.classList.remove('active');
        };
    }

    if (themeToggle) {
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark');
        }

        themeToggle.onclick = function () {
            document.body.classList.toggle('dark');
            localStorage.setItem(
                'theme',
                document.body.classList.contains('dark') ? 'dark' : 'light'
            );
        };
    }
});