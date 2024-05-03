const express = require("express");
const router = express.Router();
const asyncWrap = require("../utils/asyncWrap");
const {isLoggedIn, isAuthorized, validateListing, validateToken} = require("../middleware");
const ListingControllers = require("../controllers/listingControllers");
const multer  = require('multer');
const {storage} = require("../cloudConfig");
const upload = multer({storage});

router.get('/', asyncWrap(ListingControllers.renderListings));

router.route("/new")
    .get(isLoggedIn, ListingControllers.renderNewForm)
    .post(isLoggedIn, upload.array('listing[image]', 5), validateListing, asyncWrap(ListingControllers.createListing));

router.route("/:id")
    .get(asyncWrap(ListingControllers.listingDetails))
    .put(isLoggedIn, isAuthorized, upload.array('listing[image]', 5), validateListing, asyncWrap(ListingControllers.updateListing))
    .delete(isLoggedIn, isAuthorized, asyncWrap(ListingControllers.destroyListing));

router.get("/:id/edit", isLoggedIn, isAuthorized, asyncWrap(ListingControllers.renderEditForm));

router.post("/:id/reserve", isLoggedIn, asyncWrap(ListingControllers.renderReserve));

router.post("/:id/reserve/request", isLoggedIn, asyncWrap(ListingControllers.requestReservation));

router.get("/:id/reserve/approve/:reqToken", validateToken, asyncWrap(ListingControllers.approveReservation));

router.get("/:id/reserve/deny/:reqToken", validateToken, asyncWrap(ListingControllers.denyReservation));

router.get("/:id/reserve/pay/:reqToken", validateToken, isLoggedIn, asyncWrap(ListingControllers.renderPay));

router.get("/:id/reserve/confirm/:reqToken", validateToken, isLoggedIn, asyncWrap(ListingControllers.createOrder));

router.post("/:id/reserve/verify/:reqToken", validateToken, asyncWrap(ListingControllers.verifyPayment));

module.exports = router;