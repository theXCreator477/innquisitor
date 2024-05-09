const mongoose = require("mongoose");
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
    password: {
        type: String,
        required: true
    },
    verifyToken: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        default: Date.now() + 30 * 60 * 1000,
    },
    isVerified: {
        type: Boolean,
        default: false
    }
});

pendingUserSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});

const PendingUser = mongoose.model("PendingUser", pendingUserSchema);

module.exports = PendingUser;