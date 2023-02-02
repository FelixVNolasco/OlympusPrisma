const User = require("../models/User");
const Token = require("../models/PasswordToken");
const sendEmail = require("../utils/email/sendEmail");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");

const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Email does not exist");

  let token = await Token.findOne({ userId: user._id });
  if (token) await token.deleteOne();

  let resetToken = crypto.randomBytes(32).toString("hex");

  const hash = await CryptoJS.AES.encrypt(
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
  return link;
};

const resetPassword = async (userId, token, password) => {
  let passwordResetToken = await Token.findOne({ userId });

  if (!passwordResetToken) {
    throw new Error("Invalid or expired password reset token");
  }

  const isValid = await CryptoJS.compare(token, passwordResetToken.token);

  if (!isValid) {
    throw new Error("Invalid or expired password reset token");
  }

  const hash = await CryptoJS.AES.encrypt(
    password,
    process.env.SEC_PASSJS
  ).toString();

  await User.updateOne(
    { _id: userId },
    { $set: { password: hash } },
    { new: true }
  );

  const user = await User.findById({ _id: userId });

  sendEmail(
    user.email,
    "Password Reset Successfully",
    {
      name: user.username,
    },
    "./template/resetPassword.handlebars"
  );

  await passwordResetToken.deleteOne();

  return true;
};

module.exports = {
  requestPasswordReset,
  resetPassword,
};
