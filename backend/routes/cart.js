const express = require("express");
const { productModel, validateProduct } = require("../Models/product");
const { cartModel, validateCartItem } = require("../Models/cart");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const { User } = require("../models/User");
const mongoose = require("mongoose");

router.post("/update", authenticate, async (req, res) => {
  const { error } = validateCartItem(req.body);
  if (error) {
    const errors = {};
    error.details.forEach((err) => {
      errors[err.path[0]] = err.message.replace(/['"]/g, "");
    });

    return res.status(400).json({
      status: "fail",
      message: "Validation error",
      errors,
    });
  }

  const { productId, action } = req.body;
  const { userId } = req.user;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid Product ID format",
    });
  }

  try {
    let cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      cart = new cartModel({ user: userId, products: [], totalPrice: 0 });
    }

    const itemIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (action === "add") {
      const product = await productModel.findById(productId);
      if (!product) {
        return res.status(404).json({
          status: "fail",
          message: "Product not found",
        });
      }

      if (itemIndex > -1) {
        cart.products[itemIndex].quantity += 1;
      } else {
        cart.products.push({ productId, quantity: 1 });
      }
    }

    if (action === "increment" && itemIndex > -1) {
      cart.products[itemIndex].quantity += 1;
    }

    if (action === "decrement" && itemIndex > -1) {
      cart.products[itemIndex].quantity -= 1;
      if (cart.products[itemIndex].quantity <= 0) {
        cart.products.splice(itemIndex, 1);
      }
    }

    if (action === "remove" && itemIndex > -1) {
      cart.products.splice(itemIndex, 1);
    }

    const calculateTotalPrice = async (products) => {
      let total = 0;
      for (const item of products) {
        const prod = await productModel.findById(item.productId);
        if (prod) {
          total += prod.price * item.quantity;
        }
      }
      return total;
    };

    cart.totalPrice = await calculateTotalPrice(cart.products);
    await cart.save();

    res.status(200).json({
      status: "success",
      message: "Cart updated successfully",
      data: {
        cart: {
          id: cart._id,
          user: cart.user,
          products: cart.products,
          totalPrice: cart.totalPrice,
        },
      },
    });
  } catch (err) {
    console.error("Update Cart Error:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    const cart = await cartModel
      .findOne({ user: req.user.userId })
      .populate("products.productId");

    if (!cart) {
      return res.status(404).json({
        status: "fail",
        message: "Cart not found",
      });
    }

    const formattedCart = {
      id: cart._id,
      user: cart.user,
      totalPrice: cart.totalPrice,
      products: cart.products.map((item) => ({
        id: item._id,
        quantity: item.quantity,
        product: item.productId
          ? {
              id: item.productId._id,
              name: item.productId.name,
              price: item.productId.price,
              image: item.productId.image,
              description: item.productId.description,
            }
          : null,
      })),
    };

    res.status(200).json({
      status: "success",
      message: "Cart fetched successfully",
      data: {
        cart: formattedCart,
      },
    });
  } catch (err) {
    console.error("Cart Fetch Error:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

router.delete("/", authenticate, async (req, res) => {
  try {
    const cart = await cartModel.findOneAndUpdate(
      { user: req.user.userId },
      { products: [], totalPrice: 0 },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({
        status: "fail",
        message: "Cart not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Cart emptied successfully",
      data: {
        cart: {
          id: cart._id,
          user: cart.user,
          totalPrice: cart.totalPrice,
          products: cart.products,
          updatedAt: cart.updatedAt,
        },
      },
    });
  } catch (err) {
    console.error("Cart Delete Error:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

module.exports = router;
