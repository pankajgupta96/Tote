const mongoose = require("mongoose");
const Joi = require("joi");

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);


const validateReviewData = (data) => {
  const schema = Joi.object({
    productId: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        "string.hex": "Invalid Product ID format",
        "string.length": "Product ID must be 24 characters long",
        "any.required": "Product ID is required"
      }),
    rating: Joi.number()
      .min(1)
      .max(5)
      .required()
      .messages({
        "number.base": "Rating must be a number",
        "number.min": "Rating must be at least 1",
        "number.max": "Rating cannot exceed 5",
        "any.required": "Rating is required"
      }),
    comment: Joi.string()
      .min(10)
      .max(500)
      .required()
      .messages({
        "string.base": "Comment must be a string",
        "string.empty": "Comment cannot be empty",
        "string.min": "Comment must be at least 10 characters",
        "string.max": "Comment cannot exceed 500 characters",
        "any.required": "Comment is required"
      })
  })
    return schema.validate(data, { abortEarly: false });
}

module.exports = {
  Review: mongoose.model("Review", reviewSchema),
  validateReviewData,
};



