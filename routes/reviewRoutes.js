const express = require("express");
const router = express.Router({mergeParams: true});
const asyncWrap = require("../utils/asyncWrap");
const {isLoggedIn, validateReview} = require("../middleware");
const ReviewControllers = require("../controllers/reviewControllers");

router.post("/", isLoggedIn, validateReview, asyncWrap(ReviewControllers.createReview));

router.delete("/:reviewId", isLoggedIn, asyncWrap(ReviewControllers.destroyReview));

module.exports = router;