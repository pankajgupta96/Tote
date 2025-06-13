const express = require("express");
const stripe = require("stripe")(
  "sk_test_51RY06CBAuylJMi4kcjUYflNG68F6r3JXo3Ml4SAJ0fM9XKgXooEHoaULTvGR2BcBbbaxglBusyHvkmWJyK5GAoxb00HJqVHdG4"
);
const { orderModel } = require("../Models/order");
const { cartModel } = require("../Models/cart");
const authenticate = require("../middleware/authenticate");
const { route } = require("./order");
const router = express.Router();

router.post("/create-checkout-session", authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await cartModel
      .findOne({ user: userId })
      .populate("products.productId");
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const line_items = cart.products.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.productId.name,
        },
        unit_amount: item.productId.price * 100,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
      metadata: {
        userId: userId.toString(),
        cartId: cart._id.toString(),
      },
    });

    await cartModel.findOneAndUpdate(
      { user: userId },
      { $set: { products: [], totalPrice: 0 } }
    );

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
