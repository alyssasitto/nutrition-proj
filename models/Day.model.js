const { Schema, model } = require("mongoose");

const daySchema = new Schema({
	user: {
		type: ObjectId,
	},
	foodArray: {
		type: Array,
	},
	daysCalories: {
		type: Number,
	},
});

const Day = model("Day", daySchema);

module.exports = Day;
