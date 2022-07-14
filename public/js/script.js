// const axios = require("axios");

document.addEventListener(
	"DOMContentLoaded",
	() => {
		console.log("nutrition-app JS imported successfully!");
	},
	false
);

const hbBtn = document.querySelector(".hb");
const closeBtn = document.querySelector(".close");
const navList = document.querySelector(".list-items");
const overlay = document.querySelector(".overlay");

closeBtn.classList.add("hide");
navList.classList.add("hide");
overlay.classList.add("hide");

hbBtn.addEventListener("click", function () {
	hbBtn.classList.add("hide");
	closeBtn.classList.remove("hide");
	navList.classList.add("show");
	overlay.classList.add("show");
});

closeBtn.addEventListener("click", function () {
	hbBtn.classList.remove("hide");
	closeBtn.classList.add("hide");
	navList.classList.remove("show");
	overlay.classList.remove("show");
});

// const getFoodInfo = function (foodName) {
// 	return axios
// 		.get(
// 			`https://api.edamam.com/api/food-database/v2/parser?app_id=7249a62c&app_key=d882f0b5a9ca8ed230eda578af74b7fe&ingr=${foodName}`
// 		)
// 		.then((foodData) => {
// 			const foodInfo = foodData.data.hints[0].food;
// 			console.log(foodInfo);

// 			document.querySelector(".name").innerText = foodInfo.label;
// 		})
// 		.catch((err) => console.log("this is the error ====>", err));
// };

// document.querySelector("#search-food").addEventListener("click", function () {
// 	const food = document.querySelector("#food").value;
// 	return getFoodInfo(food);
// });
