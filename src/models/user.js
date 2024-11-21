const {Schema, model} = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Name is required'],
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid email format']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Password confirm is required'],
      validate:{
        validator: function(el) {
          return el === this.password;
        },
        message: 'Passwords do not match'
      }
    },
    isAdmin:{
      type: Boolean,
      default: false
    },
    isVarified:{
      type: Boolean,
      default: false
    },
    otp:{
      type: String,
      default: null
    },
    otpExpires:{
      type: Date,
      default: null
    },
    resetPasswordOTP:{
      type: String,
      default: null
    },
    resetPasswordOTPExpires:{
      type: Date,
      default: null
    },
    createdAt:{
      type: Date,
      default: Date.now()
    }, 
},
    {
      timestamps: true,
    }
)

// Securing or hashing Password
userSchema.pre("save", async function(next){
  const user = this;
  if(!user.isModified('password')){
    next();
  }
  try {
   const saltRound = 10
   const hashedPassword = await bcrypt.hash(user.password, saltRound);
   user.password = hashedPassword;
   user.passwordConfirm = undefined;
  } catch (error) {
   next(error);
  }
})

// generating token
userSchema.methods.generateToken = async function(){
  try {
   return jwt.sign(
     {
     userId: this._id.toString(),
     email: this.email,
     isAdmin: this.isAdmin
   },
    "hitheremynameisvaibhavshukla",
    { 
     expiresIn: '30d' 
   }
 )
  } catch (error) {
   console.error(error);
  }
}

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
 try {
   const user = this;
   return await bcrypt.compare(enteredPassword, user.password);
 } catch (error) {
   throw error;
 }
};


const user = model("User", userSchema);
module.exports = user;