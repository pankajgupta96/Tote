const mongoose = require("mongoose");
const Joi = require("joi");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true 
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1
      }
    }
  ],
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
}, { timestamps: true });

const validateCartItem = (data) => {
  const schema = Joi.object({
    productId: Joi.string()
      .length(24)
      .hex()
      .required()
      .messages({
        "string.length": "Product ID must be 24 characters",
        "string.hex": "Invalid Product ID format",
        "any.required": "Product ID is required",
      }),
    action: Joi.string()
      .valid("add", "remove", "increment", "decrement")
      .required()
      .messages({
        "any.only": "Action must be one of add, remove, increment, decrement",
        "any.required": "Action is required",
      }),
  });

  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  cartModel: mongoose.model("Cart", cartSchema),
  validateCartItem
};
