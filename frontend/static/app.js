document.addEventListener("DOMContentLoaded", function () {

    const openBtn = document.getElementById("openCities");
    const closeBtn = document.getElementById("closeCities");
    const citySidebar = document.getElementById("citySidebar");
    const cityResults = document.getElementById("cityResults");
    const weatherBtn = document.getElementById("weatherBtn");
    const searchBar = document.getElementById("searchBar");

    // -----------------------------
    // SETTINGS ELEMENTS
    // -----------------------------
    const settingsBtn = document.getElementById("settingsBtn");
    const settingsPanel = document.getElementById("settingsPanel");
    const closeSettings = document.getElementById("closeSettings");
    const themeToggle = document.getElementById("themeToggle");

    // -----------------------------
    // GLOBAL STATE
    // -----------------------------
    let currentCity = {
        name: "London",
        temp: "21°C",
        status: "Sunny",
        feels: "19°C"
    };

    // -----------------------------
    // UPDATE UI FUNCTION
    // -----------------------------
    function updateWeather(city) {
        document.getElementById("location").innerText = city.name;
        document.getElementById("main_temp").innerText = city.temp;
        document.getElementById("weather_status").innerText = city.status;
        document.getElementById("feels_like").innerText =
            "Feels like " + city.feels;

        currentCity = city;
    }

    // -----------------------------
    // INITIAL LOAD
    // -----------------------------
    updateWeather(currentCity);

    // -----------------------------
    // OPEN SIDEBAR
    // -----------------------------
    openBtn.onclick = function (e) {
        e.preventDefault();
        citySidebar.classList.add("active");
    };

    // -----------------------------
    // CLOSE SIDEBAR
    // -----------------------------
    closeBtn.onclick = function () {
        citySidebar.classList.remove("active");

        document.querySelectorAll(".city-section").forEach(section => {
            section.style.display = "block";
        });

        cityResults.innerHTML = "";
    };

    // -----------------------------
    // CITY DATA
    // -----------------------------
    const cityGroups = {
        saved: [
            { name: "London", temp: "21°C", status: "Sunny", feels: "19°C" },
            { name: "Tokyo", temp: "28°C", status: "Cloudy", feels: "30°C" },
            { name: "New York", temp: "17°C", status: "Rainy", feels: "16°C" }
        ],

        popular: [
            { name: "Paris", temp: "20°C", status: "Windy", feels: "18°C" },
            { name: "Dubai", temp: "36°C", status: "Sunny", feels: "39°C" },
            { name: "Sydney", temp: "24°C", status: "Clear", feels: "23°C" }
        ],

        recent: [
            { name: "Berlin", temp: "15°C", status: "Foggy", feels: "14°C" }
        ]
    };

    // -----------------------------
    // SIDEBAR MENU CLICK
    // -----------------------------
    document.querySelectorAll(".menu-option").forEach(option => {

        option.onclick = function () {

            const group = this.dataset.group;
            cityResults.innerHTML = "";

            document.querySelectorAll(".city-section").forEach(section => {
                section.style.display = "none";
            });

            cityGroups[group].forEach(city => {

                const item = document.createElement("div");
                item.className = "city-item";
                item.innerText = city.name;

                item.onclick = function () {

                    updateWeather(city);

                    citySidebar.classList.remove("active");

                    document.querySelectorAll(".city-section").forEach(section => {
                        section.style.display = "block";
                    });

                    cityResults.innerHTML = "";
                };

                cityResults.appendChild(item);
            });
        };
    });

    // -----------------------------
    // WEATHER BUTTON
    // -----------------------------
    weatherBtn.onclick = function (e) {
        e.preventDefault();
        updateWeather(currentCity);
    };

    // -----------------------------
    // SEARCH
    // -----------------------------
    searchBar.addEventListener("keydown", function (e) {

        if (e.key === "Enter") {

            const city = {
                name: this.value,
                temp: "25°C",
                status: "Sunny",
                feels: "24°C"
            };

            updateWeather(city);
            this.value = "";
        }
    });

    // -----------------------------
    // SETTINGS PANEL (NEW)
    // -----------------------------

    if (settingsBtn) {
        settingsBtn.onclick = function (e) {
            e.preventDefault();
            settingsPanel.classList.add("active");
        };
    }

    if (closeSettings) {
        closeSettings.onclick = function () {
            settingsPanel.classList.remove("active");
        };
    }

    if (themeToggle) {

        // load saved theme
        if (localStorage.getItem("theme") === "dark") {
            document.body.classList.add("dark");
        }

        themeToggle.onclick = function () {
            document.body.classList.toggle("dark");

            localStorage.setItem(
                "theme",
                document.body.classList.contains("dark") ? "dark" : "light"
            );
        };
    }

});