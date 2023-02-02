const Order = require("../models/Order");
const router = require("express").Router();
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("../middleware/verifyToken");
const User = require("../models/User");

//CREATE
router.post("/", async (req, res) => {
  const newOrder = new Order(req.body);
  try {
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER ORDERS
router.get("/find/:userId", async (req, res) => {
  try {
    
      const user = User.find({ userId: req.params.userId })

      if(!user) {
        throw new Error("El usuario no existe")
      }
    
    const orders = await Order.find({ userId: req.params.userId });
    console.log(orders)
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ORDER
router.get("/find/purchase/:_id", async (req, res) => {
  try {
    const order = await Order.find({ _id: req.params._id });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});


//GET LATEST USERS ORDERS
router.get("/latest", verifyTokenAndAdmin, async (req, res) => {  
  try {
    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "userId",
          as: "orders",
        },
      },
      // { $unwind: "$users" },
      // {
      //   $sort: { createdAt: -1 },
      // },
      {
        $limit: 6,
      },
    ]);
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

// GET MONTHLY INCOME
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));
  try {
    const income = await Order.aggregate([
      { $match: { createdAt: { $gte: previousMonth } } },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
