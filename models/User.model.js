const { Schema, model } = require("mongoose");

const userSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		confirmPassword: {
			type: String,
		},
		feet: {
			type: Number,

			default: 0,
		},
		inches: {
			type: Number,
		},
		weight: {
			type: Number,
		},
		age: {
			type: Number,
		},
		gender: {
			type: String,
		},
		caloriesNeeded: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

const User = model("User", userSchema);

module.exports = User;
