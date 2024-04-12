const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("./reviewSchema");

const listingSchema = new Schema({
    title: String,
    description: {
        type: String,
        default: "Not Available",
        set: v => v === "" ? "Not Available" : v
    },
    image: [
        {
            filename: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          default: 'Point',
          set: v => v === '' ? 'Point' : v
        },
        coordinates: {
          type: [Number],
          default: [77.401989, 23.258486],
          set: v => v == [] ? [77.401989, 23.258486] : v
        }
    },
    category: String, 
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({_id : {$in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;