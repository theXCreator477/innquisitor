const Listing = require("../models/listingSchema");
const {cloudinary} = require("../cloudConfig");
const geoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = geoCoding({ accessToken: process.env.MAP_ACCESS_TOKEN });

module.exports.renderListings = async (req, res) => {
    let list = await Listing.find();
    res.render("listings/listings", {list});
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

module.exports.listingDetails = async (req, res) => {
    let {id} = req.params;
    let data = await Listing.findById(id).populate([{path: "reviews", populate: {path: "owner"}}, "owner"]);
    if (!data) {
        req.flash("error", "Required Listing does not exist");
        res.redirect("/listing");
    }
    res.render("listings/details", {data});
};

module.exports.createListing = async (req, res) => {
    if (!req.files || !req.files.length) {
        req.flash("error", "Please upload at least one image");
        return res.redirect("/listing/new");
    }

    req.body.listing.image = req.files.map(file => {
        let path = file.path.replace('/upload', '/upload/f_webp,w_2000');
        return {filename: file.filename, url: path};
    });

    let location = `${req.body.listing.location}, ${req.body.listing.country}`;
    try {
        let response = await geocodingClient.forwardGeocode({
            query: location,
            limit: 1
        }).send();

        let category = req.body.listing.category;
        category = Array.isArray(category) ? category.join(", ") : category;
        req.body.listing.category = category;
        let listing = new Listing(req.body.listing);
        listing.owner = req.user._id;
        listing.geometry = response.body.features[0].geometry;
        let saved = await listing.save();



        console.log(saved);



        req.flash("success", "New Listing Added successfully");
        res.redirect("/listing");

    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/listing/new");
    }
};

module.exports.updateListing = async (req, res) => {
    let {id} = req.params;
    try {
        let listing = await Listing.findByIdAndUpdate(id, req.body.listing);
        if (req.files && req.files.length) {

            let trashFiles = listing.image.map(image => {
                return image.filename;
            });

            listing.image = req.files.map(file => {
                let path = file.path.replace('/upload', '/upload/f_webp,w_2000');
                return {url: path, filename: file.filename,};
            });

            await listing.save();
            
            for (let trash of trashFiles) {
                await cloudinary.uploader.destroy(trash);
            }
        }
        req.flash("success", "Listing Updated Successfully");
        res.redirect(`/listing/${id}`);
    } catch (e) {
        req.flash("error", e.message);
        res.redirect(`/listing/${id}`);
    }
};

module.exports.destroyListing = async (req, res) => {
    try {
        let {id} = req.params;
        let listing = await Listing.findByIdAndDelete(id);

        let trashFiles = listing.image.map(image => {
            return image.filename;
        });

        for (let trash of trashFiles) {
            await cloudinary.uploader.destroy(trash);
        }

        req.flash("success", "Listing Deleted Successfully");
        res.redirect("/listing");
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/listing");
    } 
};

module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    let  data = await Listing.findById(id);
    if (!data) {
        req.flash("error", "Required Listing does not exist");
        res.redirect("/listing");
    }
    res.render("listings/edit", {data});
};