const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//signup
router.post("/signup", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SEC_PASSJS
    ).toString(),
    urlImage: "",
  });

  try {
    const savedUser = await newUser.save();
    if (savedUser) {
      return res.status(201).json(savedUser);
    }
  } catch (err) {
    return res.status(401).json(err);
  }
});

//login
router.post("/login", async (req, res) => {
  const user = await User.findOne({
    username: req.body.username,
  });

  if (!user) {
    return res.status(401).json("User or password is wrong");
  } else {
    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.SEC_PASSJS
    );

    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    const inputPassword = req.body.password;

    if (originalPassword != inputPassword) {
      return res.status(401).json("User or password is wrong");
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.SEC_PASSJWT,
      { expiresIn: "3d" }
    );

    const { password, ...others } = user._doc;
    return res.status(200).json({ ...others, accessToken });
  }
});

module.exports = router;
