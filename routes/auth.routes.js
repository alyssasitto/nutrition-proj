const { Router } = require("express");
const router = new Router();

// Requiring bcrypt to make a hashed password
const bcrypt = require("bcryptjs");
const e = require("express");
const User = require("../models/User.model");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

const Day = require("../models/Day.model.js");

// GET ROUTES //

// Sign-up form get route
router.get("/signup", (req, res) => {
	res.render("auth/sign-up.hbs");
});

// Login form get route
router.get("/login", (req, res) => {
	res.render("auth/login.hbs");
});

// Success page get route
router.get("/success", (req, res) => {
	res.render("auth/success.hbs");
});

// Profile page get route
router.get("/userProfile", (req, res) => {
	Day.find({ user: req.session.currentUser._id })
		.sort({ currentDay: "desc" })
		.then((dayArr) => {
			if (dayArr.length === 0) {
				//display user total calories
				res.render("user/user-profile.hbs", { user: req.session.currentUser });
			} else {
				let dateFromDb = new Date(dayArr[0].currentDay);
				let todayDate = new Date();

				if (todayDate.toDateString() == dateFromDb.toDateString()) {
					// display foods from Day object and cal count
					res.render("user/user-profile.hbs", {
						user: req.session.currentUser,
						day: dayArr[0],
					});
				} else {
					//display user total calories
					res.render("user/user-profile.hbs", {
						user: req.session.currentUser,
					});
				}
			}
		});
});

// Dimensions form get route
router.get("/dimensions", (req, res) => {
	User.findById(req.session.currentUser._id).then((user) => {
		console.log(user);
		res.render("user/user-dimensions.hbs", { user });
	});
});

// Logout get route
router.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.log("something went wwrong");
		} else {
			res.redirect("/");
		}
	});
});

// POST ROUTES //

// Sign-up form post route
router.post("/signup", (req, res, next) => {
	const { name, email, password, confirmPassword } = req.body;

	if (
		name === "" ||
		email === "" ||
		password === "" ||
		confirmPassword === ""
	) {
		res.render("auth/sign-up.hbs", { errMessage: "Please enter valid input" });
	} else if (password !== confirmPassword) {
		res.render("auth/sign-up.hbs", { errMessage: "Passwords do not match" });
	} else {
		bcrypt
			.genSalt(saltRounds)
			.then((salt) => bcrypt.hash(password, salt))
			.then((hashedPassword) => {
				return User.create({
					name,
					email,
					password: hashedPassword,
				});
			})
			.then((newUser) => {
				console.log("this is the new user: ", newUser);
				res.redirect("/success");
			})
			.catch((err) => console.log(err));
	}
});

// Dimensions form post route
router.post("/dimensions", (req, res) => {
	const { feet, inches, weight, age, gender } = req.body;
	User.findByIdAndUpdate(
		req.session.currentUser._id,
		{ feet, inches, weight, age, gender },
		{ new: true }
	).then((updatedUser) => {
		if (updatedUser.gender === "Male") {
			const calories = maleCals(updatedUser);

			updatedUser.caloriesNeeded = calories;

			console.log(updatedUser.caloriesNeeded);

			updatedUser
				.save()
				.then((savedUser) => {
					res.render("user/user-profile", { user: savedUser });
					console.log(savedUser);
				})
				.catch((err) => console.log(err));
		} else if (updatedUser.gender === "Female") {
			const calories = femaleCals(updatedUser);

			updatedUser.caloriesNeeded = calories;

			updatedUser
				.save()
				.then((savedUser) => {
					res.render("user/user-profile", { user: savedUser });
					console.log(savedUser);
				})
				.catch((err) => console.log(err));
		}
	});
});

// Login form post route
router.post("/login", (req, res) => {
	console.log("session ======>", req.session);

	const { email, password } = req.body;

	if (email === "" || password === "") {
		res.render("auth/login.hbs", { errMessage: "Please enter valid input" });
		return;
	}

	User.findOne({ email }).then((user) => {
		if (!user) {
			res.render("auth/login.hbs", { errMessage: "email is not registerd" });
			return;
		} else if (bcrypt.compareSync(password, user.password)) {
			req.session.currentUser = user;
			if (
				req.session.currentUser.feet === undefined ||
				req.session.currentUser.inches === undefined ||
				req.session.currentUser.weight === undefined ||
				req.session.currentUser.age === undefined
			) {
				res.redirect("/dimensions");
			} else {
				res.render("user/user-profile.hbs", { user: req.session.currentUser });
			}
		} else {
			res.render("auth/login.hbs", { errMessage: "password is incorrect" });
		}
	});
});

// Calorie calculator functions

function lbTokg(num) {
	const kgs = num / 2.2046;
	console.log("kgs =======>", kgs);
	return kgs.toFixed();
}

function feetToCm(feet, inches) {
	const feetCm = feet * 30.48;
	const inchCm = inches * 2.54;

	const cm = feetCm + inchCm;
	console.log("cm ======>", cm);
	return cm.toFixed();
}

function maleCals(currentUser) {
	const BMR =
		66.5 +
		13.75 * lbTokg(currentUser.weight) +
		5.003 * feetToCm(currentUser.feet, currentUser.inches) -
		6.75 * currentUser.age;

	return BMR.toFixed();
}

function femaleCals(currentUser) {
	const BMR =
		665.1 +
		9.563 * lbTokg(currentUser.weight) +
		1.85 * feetToCm(currentUser.feet, currentUser.inches) -
		4.676 * currentUser.age;

	return BMR.toFixed();
}

const params = {
	key: "d882f0b5a9ca8ed230eda578af74b7fe",
	id: "7249a62c",
};

const axios = require("axios");

router.get("/search", (req, res) => {
	const foodItem = req.query.ingr;
	console.log(foodItem);

	axios
		.get(
			`https://api.edamam.com/api/food-database/v2/parser?app_id=7249a62c&app_key=d882f0b5a9ca8ed230eda578af74b7fe&ingr=${foodItem}`
		)
		.then((food) => {
			const searchedFood = food.data.hints[0].food;
			res.render("user/search-food.hbs", { foodData: food.data.hints });
			console.log(searchedFood);
		})
		.catch((err) => console.log("this is the error ===========>", err));
});

router.post("/addFood", (req, res) => {
	const { foodName, calories } = req.body;

	const foodObj = {
		foodName,
		calories,
	};

	Day.find({ user: req.session.currentUser._id })
		.sort({ currentDay: "desc" })
		.then((dayArr) => {
			console.log(dayArr, foodName, calories);
			if (dayArr.length === 0) {
				return Day.create({
					user: req.session.currentUser._id,
					foodArray: [foodObj],
					daysCalories:
						req.session.currentUser.caloriesNeeded - Number(foodObj.calories),
					currentDay: new Date().toDateString(),
				});
			} else {
				let dateFromDb = new Date(dayArr[0].currentDay);
				let todayDate = new Date();

				//if today's date matches the date of the Day model from the database, do not create a new Day. Instead, push food to existing Day Model.
				if (todayDate.toDateString() == dateFromDb.toDateString()) {
					let existingDay = dayArr[0];
					existingDay.foodArray.push(foodObj);
					existingDay.daysCalories -= Number(foodObj.calories);
					return existingDay.save();
				} else {
					return Day.create({
						user: req.session.currentUser._id,
						foodArray: [foodObj],
						daysCalories:
							req.session.currentUser.caloriesNeeded - Number(foodObj.calories),
						currentDay: new Date().toDateString(),
					});
				}
			}
		})
		.then((savedDay) => {
			console.log("saved day", savedDay);
			res.redirect("/userProfile");
		});
});

module.exports = router;
