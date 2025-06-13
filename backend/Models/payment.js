const mongoose = require("mongoose");
const Joi = require('joi');

const paymentSchema = mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    method: {
        type: String,
        required: true,
        enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery']
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed', 'refunded']
    },
    transactionID: {
        type: String,
        required: true
    }
});

const validatePayment = (data) => {
    const schema = Joi.object({
        order: Joi.string().hex().length(24).required(),
        amount: Joi.number().min(0).required(),
        method: Joi.string().valid('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery').required(),
        status: Joi.string().valid('pending', 'completed', 'failed', 'refunded').required(),
        transactionID: Joi.string().required()
    });

    return schema.validate(data);
};

module.exports = {
    paymentModel: mongoose.model("Payment", paymentSchema),
    validatePayment
};