const User = require("../models/User");

const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("../middleware/verifyToken");

const router = require("express").Router();

//UPDATE USER
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.password) {
    req.body.password = await CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SEC_PASSJS
    ).toString();
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE USER
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER with Credentials
router.get(
  "/find/?id&password",
  verifyTokenAndAuthorization,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      const { _doc } = user;
      const { password } = _doc;

      const passwordRequest = CryptoJS.AES.encrypt(
        req.params.password,
        process.env.SEC_PASSJS
      ).toString();

      if (password === passwordRequest) {
        res.status(200).json(_doc);
      } else {
        res.status(403);
      }
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

//GET ALL USER
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(4)
      : await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER STATS
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});


//GET LATEST ORDERS
router.get("/latestOrders", verifyTokenAndAdmin, async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "_id",
          as: "orders",
        },
      },
      // { $unwind: "$users" },
      // {
      //   $sort: { createdAt: -1 },
      // },
      // {
      //   $limit: 6,
      // },
    ]);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
