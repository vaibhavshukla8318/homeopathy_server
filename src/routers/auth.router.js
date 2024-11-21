const express = require('express');
const authControlers = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.route('/register').post(authControlers.register);
router.route('/verify').post(authMiddleware, authControlers.verifyAccount);
router.route('/resend-otp').post(authMiddleware, authControlers.resendOTP);
router.route('/login').post(authControlers.login);
router.route('/logout').post(authControlers.logout);
router.route('/forget-password').post(authControlers.forgotPassword);
router.route('/reset-password').post(authControlers.resetPassword);

// user Router
router.route("/user").get(authMiddleware, authControlers.user)
module.exports = router;