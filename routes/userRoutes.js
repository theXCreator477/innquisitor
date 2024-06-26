const express = require("express");
const router = express.Router();
const passport = require("passport");
const {isLoggedIn, saveRedirectInfo} = require("../middleware");
const UserControllers = require("../controllers/userControllers");
const asyncWrap = require("../utils/asyncWrap");

router.route("/signup")
    .get(UserControllers.renderSignupForm)
    .post(asyncWrap(UserControllers.signup));

router.get("/verify/:verifyToken", asyncWrap(UserControllers.verify));

router.route("/login")
    .get(UserControllers.renderLoginForm)
    .post(saveRedirectInfo, passport.authenticate("local", {failureRedirect: "/user/login", failureFlash: true}), UserControllers.login);

router.get("/logout", isLoggedIn, UserControllers.logout);

router.route("/forgot")
    .get(UserControllers.renderForgot)
    .post(asyncWrap(UserControllers.submitForgot));

router.route("/reset/:resetToken")
    .get(asyncWrap(UserControllers.renderReset))
    .post(asyncWrap(UserControllers.submitReset));

router.get("/bookings", isLoggedIn, asyncWrap(UserControllers.renderBookings));

module.exports = router;