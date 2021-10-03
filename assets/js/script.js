/* WEATHER DASHBOARD JAVASCRIPT */

/* Global Variables */

let userFormEl = document.querySelector("#user-form");
let destinationInputEl = document.querySelector("#destination");
let searchHistoryEl = document.querySelector("#search-history");
let currentContainerEl = document.querySelector("#current-container");
let futureContainerEl = document.querySelector("#future-container");
let cityNameEl = document.querySelector("#city-name");
let destinationSearchHistory = [];

/* Start Event Handlers */

// Search from text input
let formSubmitHandler = (event) => {
	event.preventDefault();
	var destination = destinationInputEl.value.trim();

	// Validate input
	if (destination) {
		getWeatherData(destination);
	} else {
		alert("Please enter a destination.");
	}
};
userFormEl.addEventListener("submit", formSubmitHandler);

// Search from search history button
let historyButtonHandler = (event) => {
	var destination = event.target.getAttribute("data-destination");

	if (destination) {
		getWeatherData(destination);
	}
};
searchHistoryEl.addEventListener("click", historyButtonHandler);

/* End Event Handlers */

/* Start main functions */

let buildTile = (data) => {
	let weatherTile = document.createElement("div");
	weatherTile.setAttribute("class", "weather-tile");

	// Date
	let dateText = document.createElement("h4");
	let date = moment(data.dt * 1000).format("ddd MMM D");
	dateText.textContent = date;

	// Weather Icon
	let conditionIcon = document.createElement("img");
	conditionIconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
	conditionIcon.setAttribute("src", conditionIconUrl);
	conditionIcon.setAttribute("alt", data.weather[0].main);

	let conditionText = document.createElement("h4");
	conditionText.textContent = `${data.weather[0].main}`;

	// Temperature
	let tempText = document.createElement("h4");
	let temp = data.temp;
	if (typeof data.temp === "object") {
		temp = data.temp.day;
	}
	tempText.textContent = `Temperature: ${Math.floor(temp)}\xB0F`;

	// Humidity
	let humidityText = document.createElement("h4");
	humidityText.textContent = `Humidity: ${data.humidity}%`;

	// Wind Speed
	let windText = document.createElement("h4");
	windText.textContent = `Wind: ${Math.floor(data.wind_speed)} MPH`;

	weatherTile.appendChild(dateText);
	weatherTile.appendChild(conditionIcon);
	weatherTile.appendChild(conditionText);
	weatherTile.appendChild(tempText);
	weatherTile.appendChild(humidityText);
	weatherTile.appendChild(windText);
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
	currentContainerEl.appendChild(buildTile(data.current));

	// future days
	for (let i = 1; i < 6; i++) {
		futureContainerEl.appendChild(buildTile(data.daily[i]));
	}
};

// Make nested API calls to get weather data
let getWeatherData = (destination) => {
	destinationInputEl.value = "";
	// API call to Mapquest to get latitude and longitude from generic place name
	let latLngSearchApiUrl = `http://open.mapquestapi.com/geocoding/v1/address?key=pmTncUmE4WZvotxffzMXoDh0tdUGP9Vc&location=${destination}`;
	fetch(latLngSearchApiUrl).then((resp1) => {
		if (resp1.ok) {
			resp1.json().then((geoData) => {
				console.log(geoData);
				let lat = geoData.results[0].locations[0].latLng.lat;
				let lng = geoData.results[0].locations[0].latLng.lng;
				let city = geoData.results[0].locations[0].adminArea5;
				let state = geoData.results[0].locations[0].adminArea3;
				let country = geoData.results[0].locations[0].adminArea1;

				if (!city || !state || !country) {
					alert(
						"Your destination search may be too broad. Please enter more specific location information for results."
					);
				} else {
					// API call to OpenWeather using latitude and longitude
					var weatherSearchApiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude=minutely,hourly,alerts&units=imperial&appid=50357db12d6b05e74bc14dbfe097e5cb`;
					fetch(weatherSearchApiUrl).then((resp2) => {
						if (resp2.ok) {
							resp2.json().then((data) => {
								// Display city name
								cityNameEl.textContent = ` for: ${city}, ${state} ${country}`.toUpperCase();
								// Send weather data to display functions
								displayWeatherData(data);
								// Save destination to localStorage

								destination = destination.toUpperCase();

								destinationSearchHistory.unshift(destination);
								destinationSearchHistory = [...new Set(destinationSearchHistory)];
								while (destinationSearchHistory.length > 10) {
									destinationSearchHistory.pop();
								}
								updateSearchHistory();

								localStorage.setItem("destinationSearchHistory", JSON.stringify(destinationSearchHistory));
							});
						}
					});
				}
			});
		}
		// TODO: fetch error handling
		// else {}
	});
};

let updateSearchHistory = () => {
	searchHistoryEl.innerHTML = "";
	for (let item in destinationSearchHistory) {
		let destButton = document.createElement("button");
		destButton.setAttribute("class", "btn");
		destButton.setAttribute("data-destination", destinationSearchHistory[item]);
		destButton.innerHTML = destinationSearchHistory[item];
		searchHistoryEl.appendChild(destButton);
	}
};
let loadLocalStorage = () => {
	let storedDestinations = localStorage.getItem("destinationSearchHistory");
	if (storedDestinations) {
		destinationSearchHistory = JSON.parse(storedDestinations);
	}
	updateSearchHistory();
};

loadLocalStorage();
