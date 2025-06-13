const express = require("express");
const mongoose = require("mongoose");
const { Wishlist, validateWishlist } = require("../Models/Whislist");
const { productModel } = require("../Models/product");
const authenticate = require("../middleware/authenticate");
const { route } = require("./auth");

const router = express.Router();

router.post("/add", authenticate, async (req, res) => {
  try {
    const { error } = validateWishlist(req.body);
    if (error) {
      return res.status(400).json({
        status: "fail",
        message: "Validation error",
        errors: {
          productId: error.message,
        },
      });
    }

    const { userId } = req.user;
    const { productId } = req.body;

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

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        products: [productId],
      });
    } else {
      if (wishlist.products.includes(productId)) {
        return res.status(400).json({
          status: "fail",
          message: "Product already in wishlist",
        });
      }
      wishlist.products.push(productId);
    }

    await wishlist.save();

    res.status(200).json({
      status: "success",
      message: "Product added to wishlist",
      data: {
        wishlist: {
          id: wishlist._id,
          user: wishlist.user,
          products: wishlist.products,
        },
      },
    });
  } catch (err) {
    console.error("Wishlist Error:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

router.delete("/remove", authenticate, async (req, res) => {
  const { error } = validateWishlist(req.body);
  if (error) {
    return res.status(400).json({
      status: "fail",
      message: "Validation error",
      errors: error.details.map((err) => ({
        field: err.path[0],
        message: err.message.replace(/['"]/g, ""),
      })),
    });
  }

  const { userId } = req.user;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({
      status: "fail",
      message: "Product ID is required",
    });
  }

  try {
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { products: productId } },
      { new: true }
    );

    if (!updatedWishlist) {
      return res.status(404).json({
        status: "fail",
        message: "Wishlist not found",
      });
    }

    const productExists = updatedWishlist.products.some(
      (id) => id.toString() === productId
    );

    if (productExists) {
      return res.status(400).json({
        status: "fail",
        message: "Product not found in wishlist",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Product removed from wishlist",
      data: {
        wishlist: {
          id: updatedWishlist._id,
          products: updatedWishlist.products,
          updatedAt: updatedWishlist.updatedAt,
        },
      },
    });
  } catch (err) {
    console.error("Wishlist remove error:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid product ID format",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    const { userId } = req.user;

    if (!userId) {
      return res.status(400).json({
        status: "fail",
        message: "User ID is required",
      });
    }

    const wishlist = await Wishlist.findOne({ user: userId })
      .populate({
        path: "products",
        select: "name price",
      })
      .select("products createdAt updatedAt");

    if (!wishlist) {
      return res.status(404).json({
        status: "fail",
        message: "Wishlist not found",
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      results: wishlist.products.length,
      data: {
        wishlist: {
          id: wishlist._id,
          items: wishlist.products,
          itemCount: wishlist.products.length,
        },
      },
    });
  } catch (err) {
    console.error("Wishlist retrieval error:", err);

    res.status(500).json({
      status: "error",
      message: "Internal server error while retrieving wishlist",
    });
  }
});

module.exports = router;
