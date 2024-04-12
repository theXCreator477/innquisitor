const Listing = require("../models/listingSchema");
const Review = require("../models/reviewSchema");

module.exports.createReview = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review); 
    newReview.owner = req.user._id;
    listing.reviews.push(newReview);
    await listing.save();
    await newReview.save();
    req.flash("success", "Review Added Successfully");
    res.redirect(`/listing/${id}`);
};

module.exports.destroyReview = async (req, res) => {
    let {id, reviewId} = req.params;

    let review = await Review.findById(reviewId);
    if (review.owner.equals(req.user._id)) {
        await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Review Deleted Successfully");
        res.redirect(`/listing/${id}`);
    } else {
        req.flash("error", "You are not authorized to DELETE this review");
        res.redirect(`/listing/${id}`);
    }
};