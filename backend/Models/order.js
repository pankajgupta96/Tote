const mongoose = require("mongoose");
const Joi = require('joi');

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    }],
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    address: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment"
    },
    delivery: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Delivery"
    }
});

const validateOrder = (data) => {
    const schema = Joi.object({
        user: Joi.string().hex().length(24).required(),
        products: Joi.array().items(Joi.string().hex().length(24)).required(),
        totalPrice: Joi.number().min(0).required(),
        address: Joi.string().min(5).max(500).required(),
        status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').optional(),
        payment: Joi.string().hex().length(24).optional(),
        delivery: Joi.string().hex().length(24).optional()
    });

    return schema.validate(data);
};

module.exports = {
    orderModel: mongoose.model("Order", orderSchema),
    validateOrder
};