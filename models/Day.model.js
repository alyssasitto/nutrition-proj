const { Schema, model } = require("mongoose");

const daySchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
	},
	foodArray: [
		{
			foodName: String,
			calories: Number,
		},
	],
	daysCalories: {
		type: Number,
	},
	currentDay: {
		type: Date,
	},
});

const Day = model("Day", daySchema);

module.exports = Day;
