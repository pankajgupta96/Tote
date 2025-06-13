const express = require("express");
const router = express.Router();
const { User, validateUser, validateLogin } = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");

router.post("/register", async (req, res) => {
  try {
    const { error } = validateUser(req.body);
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

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: "fail",
        message: "Email already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      status: "success",
      message: "User registered and logged in successfully",
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
      token,
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
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

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Authentication failed",
        errors: {
          email: "Invalid email",
        },
      });
    }

    if (!user.password) {
      return res.status(500).json({
        status: "error",
        message: "User account is not properly configured",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "fail",
        message: "Authentication failed",
        errors: {
          password: "Invalid password",
        },
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      message: "Google login successful",
      token,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    });
  }
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
    session: false,
  })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      token,
      user: req.user,
    });
  }
);

module.exports = router;
