const mongoose = require("mongoose");
const Joi = require('joi');

const deliverySchema = mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    trackingNumber: {
        type: String,
        required: true
    },
    carrier: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered']
    },
    estimatedDelivery: {
        type: Date,
        required: true
    }
});

const validateDelivery = (data) => {
    const schema = Joi.object({
        order: Joi.string().hex().length(24).required(),
        trackingNumber: Joi.string().required(),
        carrier: Joi.string().required(),
        status: Joi.string().valid('processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered').required(),
        estimatedDelivery: Joi.date().required()
    });

    return schema.validate(data);
};

module.exports = {
    deliveryModel: mongoose.model("Delivery", deliverySchema),
    validateDelivery
};