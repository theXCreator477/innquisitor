const Listing = require("./models/listingSchema");
const {reviewSchema, listingSchema} = require("./schemaValidation");
const User = require("./models/userSchema");
const PendingUser = require("./models/pendingUserSchema");

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

module.exports.registerUser = async (req, res, next) => {
    const {token} = req.params;
    let user, registeredUser;

    try {
        user = await PendingUser.findOne({verifyToken: token});
    } catch (err) {
        req.flash("error", "Something went wrong. Please try again");
        return res.redirect("/listing");
    }

    if (!user) {
        req.flash("error", "Token Expired");
        return res.redirect("/listing");
    }

    const profilePic = `/assets/Images/pic-${Math.floor(Math.random() * 5 + 1)}.avif`;

    const newUser = new User({
        username: user.username,
        email: user.email,
        profilePic: profilePic,
    });

    try {
        registeredUser = await User.register(newUser, user.password);
        await PendingUser.deleteMany({email: user.email});
    } catch (err) {
        req.flash("error", err.message);
        return res.redirect("/listing");
    }

    if (registeredUser) {        
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            next();
        });
    } else {
        req.flash("error", "Something went wrong. Please try again.");
        return res.redirect("/listing");
    }
};