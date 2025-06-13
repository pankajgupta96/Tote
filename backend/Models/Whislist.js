const mongoose = require("mongoose");
const Joi = require("joi");

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    }
  ]
}, { timestamps: true });
const validateWishlist = (data) => {
  const schema = Joi.object({
    productId: Joi.string().hex().length(24).required().messages({
      "string.hex": "Invalid product ID format",
      "string.length": "Product ID must be 24 characters long",
      "any.required": "Product ID is required"
    })
  });

  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  Wishlist: mongoose.model("Wishlist", wishlistSchema),
  validateWishlist
};
