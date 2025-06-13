const express = require("express");
const { orderModel, validateOrder } = require("../Models/order");
const { cartModel } = require("../Models/cart");
const authenticate = require("../middleware/authenticate");
const router = express.Router();

router.post("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { address } = req.body;

    const cart = await cartModel
      .findOne({ user: userId })
      .populate("products.productId");
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const productIds = cart.products.map((item) =>
      item.productId._id.toString()
    );

    const orderData = {
      user: userId,
      products: productIds,
      totalPrice: cart.totalPrice,
      address: address,
      status: "pending",
    };

    const { error } = validateOrder(orderData);
    if (error) return res.status(400).json({ error: error.message });

    const order = await orderModel.create(orderData);

    await cartModel.findOneAndUpdate(
      { user: userId },
      { products: [], totalPrice: 0 }
    );

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    const orders = await orderModel
      .find({ user: req.user.userId })
      .populate("products")
      .populate("payment");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const order = await orderModel
      .findOne({
        _id: req.params.id,
        user: req.user.userId,
      })
      .populate("products")
      .populate("payment");

    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
