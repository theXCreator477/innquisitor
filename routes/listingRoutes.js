const express = require("express");
const router = express.Router();
const asyncWrap = require("../utils/asyncWrap");
const {isLoggedIn, isAuthorized, validateListing} = require("../middleware");
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

module.exports = router;