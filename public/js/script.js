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
