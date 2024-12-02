const User = require('../models/user');
const sendEmail = require('../utils/email'); 
const generateOtp = require('../utils/generateOtp');  


// Register user
register = async (req, res) => {
  try {
    const { username, email, password, passwordConfirm } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists with this email" });

    const otp = generateOtp();
    const otpExpires = Date.now() + 24 * 60 * 60 * 1000;

    const user = await User.create({ username, email, password, passwordConfirm, otp, otpExpires });

    await sendEmail({
      email: user.email,
      subject: 'OTP for Account Verification',
      html: `<h1>Your OTP is: ${otp}</h1>`,
    });

    res.status(201).json({
      message: "User registered successfully. Verification OTP sent.",
      token: await user.generateToken(),
      userId: user._id.toString()
    });
  } catch (error) { 
    res.status(500).json({ message: "Registration error", error });
  }
};

// Verify account with OTP
verifyAccount = async (req, res) => {
  const { otp } = req.body;

  if(!otp){
    return res.status(400).json({ message: "Please enter OTP" });
  }
  // const user = await User.findById(req.user.id);

  const user = req.user;
  if (user.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }
  if (user.otpExpires < Date.now()) {
    return res.status(400).json({ message: "expired OTP" });
  }

  user.isVarified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ message: "Account verified successfully.", user });
};

// Resend OTP
resendOTP = async (req, res) => {
  const { email } = req.user;

  if(!email){
    res.status(400).json({ message: "Email is required to resend an OTP" });
  }

  const user = await User.findOne({ email });

  if(!user){
    res.status(400).json({ message: "User not found" });
  }

  if(user.isVarified){
     return res.status(400).json({ message: "User already verified" });
  }

  const newOtp = generateOtp();
  user.otp = newOtp;
  user.otpExpires = Date.now() + 24 * 60 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  await sendEmail({ email: user.email, subject: 'Resend OTP', html: `<h1>Your new OTP is: ${newOtp}</h1>` });
  
  res.status(200).json({status:'success', message: "OTP resent successfully" });
};

// Login user
login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  res.status(200).json({
    message: "Login successful",
    token: await user.generateToken(),
    userId: user._id.toString()
  });
};

// Logout user
logout = (req, res) => {
  res.cookie('token', 'loggedout', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.status(200).json({ message: "Logged out successfully" });
};

// Forgot password
forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found with that email" });

  const otp = generateOtp();
  user.resetPasswordOTP = otp;
  user.resetPasswordOTPExpires = Date.now() + 300000;  // OTP valid for 5 minutes

  await user.save({ validateBeforeSave: false });
  await sendEmail({ email: user.email, subject: 'Reset Password OTP', html: `<h1>Your reset OTP is: ${otp}</h1>` });
  
  res.status(200).json({ message: "Reset password OTP sent successfully" });
};

// Reset password
resetPassword = async (req, res) => {
  const { email, otp, password, passwordConfirm } = req.body;
  const user = await User.findOne({
    email,
    resetPasswordOTP: otp,
    resetPasswordOTPExpires: { $gt: Date.now() }
  });

  if (!user) return res.status(400).json({ message: "Invalid OTP or OTP expired" });

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpires = undefined;

  await user.save();

  res.status(200).json({ message: "Password reset successful. You can now log in with your new password." });
};


// to send user data = User Controller
const user = async (req, res) =>{
  try {
    const userData = req.user;
   
    console.log(userData);
    res.status(200).json({userData });
  } catch (error) {
     console.log(`error from the user route ${error}`);
  }
 }



module.exports = { register, verifyAccount, resendOTP, login, logout, forgotPassword, resetPassword, user};