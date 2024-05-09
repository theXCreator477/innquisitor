const Listing = require("./models/listingSchema");
const {reviewSchema, listingSchema} = require("./schemaValidation");
const User = require("./models/userSchema");
const PendingUser = require("./models/pendingUserSchema");
const ExpressError = require("./utils/ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectInfo = {
            url: req.originalUrl,
            method: req.method
        }
        req.flash("error", "Looks like you're not logged in. You must Log in first!!");
        res.redirect("/user/login");
    }
    else next();
};

module.exports.saveRedirectInfo = (req, res, next) => {
    if (req.session.redirectInfo) res.locals.redirectInfo = req.session.redirectInfo;
    next();
};

module.exports.isAuthorized = async (req, res, next) => {
    let listingId = req.params.id;
    let listing = await Listing.findById(listingId).populate("owner");
    let ownerId = listing.owner._id;
    let currentUserId = req.user._id;
    if (currentUserId.equals(ownerId)) next();
    else {
        req.flash("error", "You are not authorized to take this action");
        res.redirect(`/listing/${listingId}`);
    }
};

module.exports.validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if (error) {
        let errorMsg = error.details.map(e => e.message).join(",");
        req.flash("error", errorMsg);
        res.redirect(`/listing/${req.params.id}`);
    } else next();
};

module.exports.validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if (error) {
        let errorMsg = error.details.map(e => e.message).join(",");
        req.flash("error", errorMsg);
        res.redirect(`/listing`);
    } else next();
};

module.exports.validateToken = async (req, res, next) => {
    let reqToken = req.params.reqToken;
    const user = await User.findOne({reqToken, reqTokenExpiration: {$gt: Date.now()}});

    if (!user) {
        req.flash("error", "Token Expired");
        return res.redirect("/listing");
    }
    next();
};

module.exports.verifyToken = async (req, res, next) => {
    console.log("VERIFY TOKEN MIDDLEWARE STARTED");
    let {token} = req.params;
    try {
        const pendingUser = await PendingUser.findOne({verifyToken: token});
        if (!pendingUser) {
            console.log("IF BLOCK STARTED");
            throw new ExpressError(410, "Verification link expired");
        }
        req.session.pendingUser = pendingUser;
        console.log("JUMPING TO NEXT MIDDLEWARE FROM VERIFY");
        next();
    } catch (err) {
        next(err);
    }
    console.log("VERIFY TOKEN MIDDLEWARE ENDED");
};

module.exports.registerUser = async (req, res, next) => {
    console.log("REGISTER MIDDLEWARE STARTED");
    const {username, email, password} = req.session.pendingUser;
    // const profilePic = `/assets/Images/pic-${Math.floor(Math.random() * 5 + 1)}.avif`;
    const profilePic = `/assets/Images/pic-1.avif`;
    const newUser = new User({username, email, profilePic});
    try {
        const registeredUser = await User.register(newUser, password);
        req.session.pendingUser = undefined;
        req.session.registeredUser = registeredUser;
        console.log("JUMPING TO NEXT MIDDLEWARE FROM REGISTER");
        next();
    } catch (err) {
        next(err);
    }
    console.log("REGISTER MIDDLEWARE ENDED");
};