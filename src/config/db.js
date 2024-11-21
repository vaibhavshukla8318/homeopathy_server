const mongoose = require('mongoose');

const URI = "mongodb://localhost:27017/blogs";
const connectDB = async() =>{
  try {
    await mongoose.connect(URI)
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("Error is coming from mongoDB connection", error);
  }
}

module.exports = connectDB;