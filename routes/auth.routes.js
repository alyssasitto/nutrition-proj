const { Router } = require("express");
const router = new Router();

// Requiring bcrypt to make a hashed password
const bcrypt = require("bcryptjs");
const e = require("express");
const User = require("../models/User.model");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

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
	res.render("user/user-profile.hbs");
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
				req.session.currentUser.height === undefined ||
				req.session.currentUser.inches === undefined ||
				req.session.currentUser.weight === undefined ||
				req.session.currentUser.age === undefined
			) {
				res.redirect("/dimensions");
			} else {
				console.log("cals --------", req.session.currentUser.caloriesNeeded);
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

module.exports = router;
