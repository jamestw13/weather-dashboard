let userFormEl = document.querySelector("#user-form");
let destinationInputEl = document.querySelector("#destination");
let searchHistoryEl = document.querySelector("#search-history");
let currentContainerEl = document.querySelector("#current-container");
let futureContainerEl = document.querySelector("#future-container");

let formSubmitHandler = (event) => {
	event.preventDefault();
	var destination = destinationInputEl.value.trim();
	console.log(destination);
};

userFormEl.addEventListener("submit", formSubmitHandler);
