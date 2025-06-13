const express = require("express");
const { productModel, validateProduct } = require("../Models/product");
const router = express.Router();

router.get("/", async function (req, res) {
  try {
    const products = await productModel.find();

    const response = {
      status: "success",
      results: products.length,
      data: {
        products: products.map((product) => ({
          id: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          stock: product.stock,
          description: product.description,
        })),
      },
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

//admin only

router.post("/", async function (req, res) {
  try {
    const { error } = validateProduct(req.body);
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

    let { name, price, category, stock, description } = req.body;

    const newProduct = await productModel.create({
      name,
      price,
      category,
      stock,
      description,
    });

    res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (err) {
    console.error("Error creating product:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { name, category } = req.query;

    const filter = {};
    if (name) filter.name = { $regex: name, $options: "i" };
    if (category) filter.category = { $regex: category, $options: "i" };

    const products = await productModel.find(filter).select("-__v");

    if (products.length === 0) {
      return res.status(200).json({
        status: "success",
        results: 0,
        message: "Product not found",
      });
    }

    const response = {
      status: "success",
      results: products.length,
      data: {
        products: products.map((product) => ({
          id: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          stock: product.stock,
          description: product.description,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        })),
      },
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

module.exports = router;
