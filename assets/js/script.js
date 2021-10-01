/* WEATHER DASHBOARD JAVASCRIPT */

/* Global Variables */

let userFormEl = document.querySelector("#user-form");
let destinationInputEl = document.querySelector("#destination");
let searchHistoryEl = document.querySelector("#search-history");
let currentContainerEl = document.querySelector("#current-container");
let futureContainerEl = document.querySelector("#future-container");

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

let getWeatherData = (destination) => {
	var latLngSearchApiUrl = `http://open.mapquestapi.com/geocoding/v1/address?key=pmTncUmE4WZvotxffzMXoDh0tdUGP9Vc&location=${destination}`;
	fetch(latLngSearchApiUrl).then((resp1) => {
		if (resp1.ok) {
			resp1.json().then((geoData) => {
				var lat = geoData.results[0].locations[0].latLng.lat;
				var lng = geoData.results[0].locations[0].latLng.lng;
				var weatherSearchApiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude=minutely,hourly,alerts&appid=53d7e954411fdc683f116a1ccc0faa89`;

				fetch(weatherSearchApiUrl).then((resp2) => {
					if (resp2.ok) {
						resp2.json().then((weathData) => {
							console.log(weathData);
						});
					}
				});
			});
		}
	});
};
