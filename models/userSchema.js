const mongoose = require("mongoose");
const {Schema} = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");
const crypto = require("crypto");

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        message: "Username already exists"
    },
    email: {
        type: String,
        required: true,
        unique: true,
        message: "Email address already exists"
    },
    profilePic: {
        type: String,
    },
    resetToken: String,
    resetTokenExpiration: Date,
    reqToken: String,
    reqTokenExpiration: Date,
    selectedDates: [String],
    reservations: [
        {
            type: Schema.Types.ObjectId,
            ref: "Reservation"
        }
    ]
});

userSchema.methods.generateResetToken = function () {
    this.resetToken = crypto.randomBytes(16).toString("hex");
    this.resetTokenExpiration = Date.now() + (5 * 60 * 1000); // expires in 5 minutes
    return this.resetToken;
};

userSchema.methods.generateReqToken = function () {
    this.reqToken = crypto.randomBytes(16).toString("hex");
    this.reqTokenExpiration = Date.now() + (24 * 60 * 60 * 1000); // expires in 24 hours
    return this.reqToken;
};

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);