const router = require("express").Router();

// const {
//   resetPasswordRequestController,
//   resetPasswordController,
// } = require("../controllers/ResetController");

const {
  requestPasswordReset,
  resetPassword,
} = require("../services/AuthService");

// router.post("/requestResetPassword", resetPasswordRequestController);
router.post("/requestResetPassword", async (req, res) => {
  try {
    const requestPasswordResetService = await requestPasswordReset(
      req.body.email
    );
    return res.status(200).json(requestPasswordResetService);
  } catch (error) {
    return res.status(500).json(error);
  }
});
// router.post("/resetPassword", resetPasswordController);
router.post("/resetPassword", async (req, res, next) => {
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
});

module.exports = router;
