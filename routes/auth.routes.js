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

// POST ROUTES

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

// Login form post route
router.post("/login", (req, res) => {
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
			res.render("user/user-profile", { user });
			res.redirect("/userProfile");
		} else {
			res.render("auth/login.hbs", { errMessage: "password is incorrect" });
		}
	});
});

module.exports = router;
