const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const pendingUserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    salt: String,
    hash: String,
    verifyToken: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    }
}, {
    toObject: {
      virtuals: true
    }
});

pendingUserSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});

pendingUserSchema.plugin(passportLocalMongoose);

const PendingUser = mongoose.model("PendingUser", pendingUserSchema);

module.exports = PendingUser;