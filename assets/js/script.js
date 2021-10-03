/* WEATHER DASHBOARD JAVASCRIPT */

/* Global Variables */

let userFormEl = document.querySelector("#user-form");
let destinationInputEl = document.querySelector("#destination");
let searchHistoryEl = document.querySelector("#search-history");
let currentContainerEl = document.querySelector("#current-container");
let futureContainerEl = document.querySelector("#future-container");
let cityNameEl = document.querySelector("#city-name");

/* Start Event Handlers */

// Search from text input
let formSubmitHandler = (event) => {
	event.preventDefault();
	var destination = destinationInputEl.value.trim();

	// Validate input
	if (destination) {
		getWeatherData(destination);
		destinationInputEl.value = "";
	} else {
		alert("Please enter a city");
	}
};
userFormEl.addEventListener("submit", formSubmitHandler);

/* End Event Handlers */

/* Start main functions */

// Display current weather data on page
let displayCurrentWeather = (data) => {
	currentContainerEl.innerHTML = "";

	// Date
	let dateText = document.createElement("h4");
	dateText.textContent = `${moment().format("MMM D")}`;

	// Weather Icon
	let conditionText = document.createElement("h4");
	conditionText.textContent = `Condition: ${data.weather[0].main}`;

	let conditionIcon = document.createElement("img");
	conditionIconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
	conditionIcon.setAttribute("src", conditionIconUrl);
	conditionIcon.setAttribute("alt", data.weather[0].main);

	// Temperature
	let tempText = document.createElement("h4");
	tempText.textContent = `Temperature: ${data.temp} \xB0F`;

	// Humidity
	let humidityText = document.createElement("h4");
	humidityText.textContent = `Humidity: ${data.humidity}%`;

	// Wind Speed
	let windText = document.createElement("h4");
	windText.textContent = `Wind: ${data.wind_speed} MPH`;
	// UV Index
	let uviText = document.createElement("h4");
	let uviSpan = document.createElement("span");
	uviSpan.setAttribute("data-index", data.uvi);

	uviText.innerHTML = `UV Index: <span id="uvi-span" data-index=${Math.floor(data.uvi)}>${data.uvi}</span>`;

	currentContainerEl.appendChild(dateText);
	currentContainerEl.appendChild(conditionText);
	currentContainerEl.appendChild(conditionIcon);
	currentContainerEl.appendChild(tempText);
	currentContainerEl.appendChild(humidityText);
	currentContainerEl.appendChild(windText);
	currentContainerEl.appendChild(uviText);
};

// Make nested API calls to get weather data
let getWeatherData = (destination) => {
	// API call to Mapquest to get latitude and longitude from generic place name
	let latLngSearchApiUrl = `http://open.mapquestapi.com/geocoding/v1/address?key=pmTncUmE4WZvotxffzMXoDh0tdUGP9Vc&location=${destination}`;
	fetch(latLngSearchApiUrl).then((resp1) => {
		if (resp1.ok) {
			resp1.json().then((geoData) => {
				console.log(geoData);
				let lat = geoData.results[0].locations[0].latLng.lat;
				let lng = geoData.results[0].locations[0].latLng.lng;
				// API call to OpenWeather using latitude and longitude
				var weatherSearchApiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude=minutely,hourly,alerts&units=imperial&appid=50357db12d6b05e74bc14dbfe097e5cb`;
				fetch(weatherSearchApiUrl).then((resp2) => {
					if (resp2.ok) {
						resp2.json().then((data) => {
							// Display city name
							cityNameEl.textContent = ` for: ${destination}`.toUpperCase();
							// Send weather data to display functions
							displayCurrentWeather(data.current);
							// displayFutureWeather(weathData);
						});
					}
				});
			});
		}
		// TODO: fetch error handling
		// else {}
	});
};
