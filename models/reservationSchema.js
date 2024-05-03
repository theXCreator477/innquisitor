const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reservationSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing"
    },
    dates: [String],
    amount: Number,
});

const Reservation = mongoose.model("Reservation", reservationSchema);

module.exports = Reservation;