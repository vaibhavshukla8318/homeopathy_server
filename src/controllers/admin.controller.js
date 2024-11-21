// controller.admin.js

const User = require('../models/user');
const Contact = require('../models/contact.model')


// For Users

// get All users for admin 
const getAllUsers = async (req, res) =>{
  try {
     const user = await User.find({}, {password: 0});
    //  console.log(user);

     if(!user || user.length === 0){
      return res.status(404).json({message: "No user found"});
     }
     res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}


// get user by id(single user)

const getUserById = async (req, res) => {
  try {
    const id = req.params.id
    const user = await User.findOne({_id: id}, {password: 0});

    if(!user){
      return res.status(404).json({message: "No user found with this ID"});
    }
    // console.log(user)
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

// Update user by id(single user update)
const updateUserById = async(req, res)=>{
  try {
    const id = req.params.id;
    const updateUserData = req.body;
    const updatedData = await User.updateOne({_id: id}, {$set: updateUserData});

    return res.status(200).json(updatedData);
}
  catch(error){
    next(error);
  }
}

// delete user by id through admin

const deleteUserById = async (req, res) => {
  try {
    const id = req.params.id
    const user = await User.deleteOne({_id: id});

    if(!user){
      return res.status(404).json({message: "No user found with this ID"});
    }
    res.status(200).json({message: "User deleted successfully"});
  } catch (error) {
    next(error);
  }
}



//  For Contacts


// get all contact for admin

const getAllContact = async (req, res) => {
  try {
    const contact = await Contact.find({});

    if(!contact || contact.length === 0){
      return res.status(404).json({message: "No contact found"});
    }
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
}


// delete contacts by id through admin

const deleteConatactById = async (req, res) => {
  try {
    const id = req.params.id
    const user = await Contact.deleteOne({_id: id});

    if(!user){
      return res.status(404).json({message: "No Contact found with this ID"});
    }
    res.status(200).json({message: "Contact deleted successfully"});
  } catch (error) {
    next(error);
  }
}

module.exports = {getAllUsers, getAllContact, deleteUserById, getUserById,updateUserById, deleteConatactById};