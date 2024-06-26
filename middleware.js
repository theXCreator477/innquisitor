const Listing = require("./models/listingSchema");
const {reviewSchema, listingSchema} = require("./schemaValidation");
const User = require("./models/userSchema");
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
        next(new ExpressError(410, "Request token expired"));
    }
    next();
};