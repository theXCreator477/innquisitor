const Joi = require("joi");

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        comment: Joi.string().required().min(10),
        rating: Joi.number().required().min(1).max(5)
    }).required(),
});

module.exports.listingSchema = Joi.object({
    listing : Joi.object({
        title: Joi.string().required().max(50),
        description: Joi.string().allow("", null, "Not Available").min(50).max(1000),
        price: Joi.number().required().min(1000),
        location: Joi.string().required(),
        country: Joi.string().required(),
        category: Joi.alternatives().try(
            Joi.string().required(),
            Joi.array().items(Joi.string())
        ).required(),
    }).required(),
});