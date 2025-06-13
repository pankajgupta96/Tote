const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { Review, validateReviewData } = require("../Models/Review");
const { productModel } = require("../Models/product");
const { User } = require("../models/User");
const authenticate = require("../middleware/authenticate");

router.post("/", authenticate, async (req, res) => {
  try {
    const { error } = validateReviewData(req.body);
    if (error) {
      const errors = error.details.reduce((acc, err) => {
        acc[err.path[0]] = err.message.replace(/['"]/g, "");
        return acc;
      }, {});
      return res.status(400).json({
        status: "fail",
        message: "Validation error",
        errors,
      });
    }

    const { productId, rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid Product ID format",
      });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const existingReview = await Review.findOne({
      productId,
      userId: req.user.userId,
    });

    if (existingReview) {
      return res.status(400).json({
        status: "fail",
        message: "You have already reviewed this product",
      });
    }

    const review = await Review.create({
      productId: product._id,
      productName: product.name,
      userId: user._id,
      userName: user.name,
      rating,
      comment,
    });

    await updateProductRating(productId);

    res.status(201).json({
      status: "success",
      message: "Review added successfully",
      data: {
        review: {
          id: review._id,
          productId: review.productId,
          productName: review.productName,
          userId: review.userId,
          userName: review.userName,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
        },
      },
    });
  } catch (err) {
    console.error("Review Error:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

async function updateProductRating(productId) {
  const reviews = await Review.find({ productId });
  const averageRating =
    reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  await productModel.findByIdAndUpdate(productId, {
    averageRating: parseFloat(averageRating.toFixed(1)),
    reviewCount: reviews.length,
  });
}

router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid Product ID format",
      });
    }

    const reviews = await Review.find({ productId });

    res.status(200).json({
      status: "success",
      message: "Reviews fetched successfully",
      results: reviews.length,
      data: {
        reviews: reviews.map((review) => ({
          id: review._id,
          productId: review.productId,
          productName: review.productName,
          userId: review.userId,
          userName: review.userName,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
        })),
      },
    });
  } catch (err) {
    console.error("Get Reviews Error:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

module.exports = router;
