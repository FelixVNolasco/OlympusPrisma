const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const path = require("path");
const authRouter = require("./routes/auth");
const productsRouter = require("./routes/product");
const userRouter = require("./routes/user");
const cartRouter = require("./routes/cart");
const orderRouter = require("./routes/order");
const checkoutRouter = require("./routes/checkout");
const restorePasswordRouter = require("./routes/restorePassword");
const stripe = require("./routes/stripe");

const categoryRouter = require("./routes/categories");

const app = express();

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connection Successfull!"))
  .catch((err) => {
    console.log(err);
  });

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/auth", restorePasswordRouter);
app.use("/api/stripe", stripe);
app.use("/api/categories", categoryRouter);

app.get("/", (req, res) => {
  res.send("HOME");
});

module.exports = app;
