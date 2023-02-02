const Token = require("../models/PasswordToken");
const User = require("../models/User");
const {
  requestPasswordReset,
  resetPassword,
} = require("../services/AuthService");

const resetPasswordRequestController = async (req, res, next) => {
  try {
    // const requestPasswordResetService = await requestPasswordReset(
    //   req.body.email
    // );

    // const user = await User.findOne({ email });
    const user = await User.findOne(req.body.email);
    if (!user) throw new Error("Email does not exist");

    let token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();

    let resetToken = crypto.randomBytes(32).toString("hex");

    const hash = CryptoJS.AES.encrypt(
      resetToken,
      process.env.SEC_PASSJS
    ).toString();

    await new Token({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    }).save();

    const link = `${process.env.CLIENT_URL}/passwordReset?token=${resetToken}&id=${user._id}`;

    await sendEmail(
      user.email,
      "Recuperación de Contraseña - Olympus Store",
      {
        name: user.username,
        link: link,
      },
      "./template/requestResetPassword.handlebars"
    );
    return res.status(200).json("OK");
  } catch (error) {
    return res.status(500).json(error);
  }
};

const resetPasswordController = async (req, res, next) => {
  try {
    const resetPasswordService = await resetPassword(
      req.body.userId,
      req.body.token,
      req.body.password
    );
    return res.status(200).json(resetPasswordService);
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = {
  resetPasswordRequestController,
  resetPasswordController,
};
