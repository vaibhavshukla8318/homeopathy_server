const express = require('express');
const adminControllers = require('../controllers/admin.controller')
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");


const router = express.Router();

// //routes for user

// get all users(all users)
router.route('/users').get(authMiddleware, adminMiddleware, adminControllers.getAllUsers);

// get user by id(single user)
router.route('/users/:id').get(authMiddleware, adminMiddleware, adminControllers.getUserById);

// update user data by id

router.route('/users/update/:id').patch(authMiddleware, adminMiddleware, adminControllers.updateUserById);

// delete user by id
router.route('/users/delete/:id').delete(authMiddleware, adminMiddleware, adminControllers.deleteUserById);


// //routes for contacts

// get all contact
router.route('/contact').get(authMiddleware, adminMiddleware, adminControllers.getAllContact)

// delete conact by id
router.route('/contact/delete/:id').delete(authMiddleware, adminMiddleware, adminControllers.deleteConatactById);

module.exports = router;