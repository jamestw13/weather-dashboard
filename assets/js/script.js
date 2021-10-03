/* WEATHER DASHBOARD JAVASCRIPT */

/* Global Variables */

// HTML Elements
let userFormEl = document.querySelector("#user-form");
let destinationInputEl = document.querySelector("#destination");
let searchHistoryEl = document.querySelector("#search-history");
let currentTitleEl = document.querySelector("#current-title");
let currentContainerEl = document.querySelector("#current-container");
let forecastTitleEl = document.querySelector("#forecast-title");
let futureContainerEl = document.querySelector("#future-container");
let cityNameEl = document.querySelector("#city-name");

// Search history array
let destinationSearchHistory = [];

/* Start Event Handlers */

// Search from text input
let formSubmitHandler = (event) => {
	event.preventDefault();

	// Get value from search input
	var destination = destinationInputEl.value.trim();

	// Validate input
	if (destination) {
		// Send value to API calls
		getWeatherData(destination);
	} else {
		alert("Please enter a destination.");
	}
};
// Search bar event listener
userFormEl.addEventListener("submit", formSubmitHandler);

// Search from search history button
let historyButtonHandler = (event) => {
	// get value from button
	var destination = event.target.getAttribute("data-destination");

	// Send value to API calls
	getWeatherData(destination);
};
// Search history event listener
searchHistoryEl.addEventListener("click", historyButtonHandler);

/* End Event Handlers */

/* Start main functions */

// Create a tile with weather information from OpenWeather API
let buildTile = (data) => {
	// Tile Element
	let weatherTile = document.createElement("div");
	weatherTile.setAttribute("class", "weather-tile");

	// Date Element
	let dateText = document.createElement("h4");
	let date = moment(data.dt * 1000).format("ddd MMM D");
	dateText.textContent = date;

	// Weather icon Element
	let conditionIcon = document.createElement("img");
	conditionIconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
	conditionIcon.setAttribute("src", conditionIconUrl);
	conditionIcon.setAttribute("alt", data.weather[0].main);

	// Weather Condtion Element
	let conditionText = document.createElement("h4");
	conditionText.textContent = `${data.weather[0].main}`;

	// Temperature Element
	let tempText = document.createElement("h4");
	let temp = data.temp;
	if (typeof data.temp === "object") {
		temp = data.temp.day;
	}
	tempText.textContent = `Temperature: ${Math.floor(temp)}\xB0F`;

	// Humidity Element
	let humidityText = document.createElement("h4");
	humidityText.textContent = `Humidity: ${data.humidity}%`;

	// Wind Speed Element
	let windText = document.createElement("h4");
	windText.textContent = `Wind: ${Math.floor(data.wind_speed)} MPH`;

	// Append elements to tile element
	weatherTile.appendChild(dateText);
	weatherTile.appendChild(conditionIcon);
	weatherTile.appendChild(conditionText);
	weatherTile.appendChild(tempText);
	weatherTile.appendChild(humidityText);
	weatherTile.appendChild(windText);

	// Add UV Index line if tile is for current date
	if (typeof data.temp !== "object") {
		// UV Index
		let uviText = document.createElement("h4");
		let uviSpan = document.createElement("span");
		uviSpan.setAttribute("data-index", data.uvi);

		uviText.innerHTML = `UV Index: <span id="uvi-span" data-index=${Math.floor(data.uvi)}>${data.uvi}</span>`;
		weatherTile.appendChild(uviText);
	}

	return weatherTile;
};

// Display current weather data on page
let displayWeatherData = (data) => {
	// Clear old weather data
	currentContainerEl.innerHTML = "";
	futureContainerEl.innerHTML = "";

	// current day
	currentTitleEl.textContent = "Current Conditions";
	currentContainerEl.appendChild(buildTile(data.current));

	// future days
	forecastTitleEl.textContent = "5-Day Forecast";
	for (let i = 1; i < 6; i++) {
		futureContainerEl.appendChild(buildTile(data.daily[i]));
	}
};

// Make nested API calls to get weather data
let getWeatherData = (destination) => {
	// Clear input
	destinationInputEl.value = "";

	// API call to Mapquest to get latitude and longitude from generic place name
	let latLngSearchApiUrl = `http://open.mapquestapi.com/geocoding/v1/address?key=${secrets.MAPQUESTAPIKEY}&location=${destination}`;
	fetch(latLngSearchApiUrl)
		.then((resp1) => {
			if (resp1.ok) {
				resp1.json().then((geoData) => {
					let lat = geoData.results[0].locations[0].latLng.lat;
					let lng = geoData.results[0].locations[0].latLng.lng;
					let city = geoData.results[0].locations[0].adminArea5;
					let state = geoData.results[0].locations[0].adminArea3;
					let country = geoData.results[0].locations[0].adminArea1;

					// Check that destination is specific enough to return a city, state and country identifier
					if (!city || !state || !country) {
						alert(
							"Your destination search may be too broad. Please enter more specific location information for results."
						);
					} else {
						// update destination variable with validated search string
						let destination = `${city}, ${state} ${country}`;

						// Nested API call
						// API call to OpenWeather using latitude and longitude
						var weatherSearchApiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude=minutely,hourly,alerts&units=imperial&appid=${secrets.OPENWEATHERAPIKEY}`;
						fetch(weatherSearchApiUrl).then((resp2) => {
							if (resp2.ok) {
								resp2.json().then((data) => {
									// Display city name in header
									cityNameEl.innerHTML = ` for: ${destination}`;

									// Send weather data to display functions
									displayWeatherData(data);

									// Save destination to localStorage
									// Add to front of search history array
									destinationSearchHistory.unshift(destination);
									// Remove repeated searches from history
									destinationSearchHistory = [...new Set(destinationSearchHistory)];

									// Limit of 10 searches in history - pop extra
									while (destinationSearchHistory.length > 10) {
										destinationSearchHistory.pop();
									}

									// Update search history Bar
									updateSearchHistoryBar();

									// Update localstorage
									localStorage.setItem("destinationSearchHistory", JSON.stringify(destinationSearchHistory));
								});
							}
						});
					}
				});
			}
		})
		.catch((error) => {
			console.log(error);
			alert(
				"There was an issue with getting your information. The data service might be down. Please check your internet connection and try again in a few minutes."
			);
		});
};

// Update search history bar
let updateSearchHistoryBar = () => {
	// clear old data
	searchHistoryEl.innerHTML = "";

	// loop over search history array
	for (let item in destinationSearchHistory) {
		// Make button element
		let destButton = document.createElement("button");
		destButton.setAttribute("class", "btn");
		destButton.setAttribute("data-destination", destinationSearchHistory[item]);
		destButton.innerHTML = destinationSearchHistory[item];

		// Add button to search history bar
		searchHistoryEl.appendChild(destButton);
	}
};

// Load any search history array from localStorage onto screen
let loadLocalStorage = () => {
	let storedDestinations = localStorage.getItem("destinationSearchHistory");
	if (storedDestinations) {
		destinationSearchHistory = JSON.parse(storedDestinations);
	}
	updateSearchHistoryBar();
};

// Initiate page search history
loadLocalStorage();
