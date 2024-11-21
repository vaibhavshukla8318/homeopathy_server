const adminMiddleware = async (req, res, next )=>{
  try {
    const adminRole = req.user.isAdmin;

    // if user is not an admin
    if(!adminRole){
      return res.status(403).json({message: "Access Denied!. User is not an admin"});
    }

    // if user an admin then proceed to the next step
    next();
  } catch (error) {
      next(error);
  }
}

module.exports = adminMiddleware;