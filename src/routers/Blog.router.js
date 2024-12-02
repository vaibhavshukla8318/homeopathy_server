// router.blogs.js

const express = require('express');
const router = express.Router();
const blogsControllers = require("../controllers/Blog.controllers");
const {upload} = require('../controllers/Blog.controllers')
const authMiddleware = require("../middlewares/auth.middleware");

// get all blogs, get blogs by pagination, get blogs by id, update blogs by id, add blogs, delete blogs by id

router.route('/allblogs').get(blogsControllers.getAllblogs)
router.route('/blogs').get( blogsControllers.blogs)
router.route('/blogs/:id').get(blogsControllers.getblogsById)
router.route('/blogs/update/:id').patch(authMiddleware, blogsControllers.updateblogById)
router.route('/addedblogs').post(authMiddleware,
  //  upload.single('image'), 
  upload.fields([
    { name: 'image', maxCount: 1 }, // Main image file
    { name: 'thumbnailImage', maxCount: 1 }, // Thumbnail image file
  ]), 
   blogsControllers.addblogs)
router.route('/blogs/delete/:id').delete(authMiddleware, blogsControllers.deleteblog)
router.get('/blogs/category/:category', blogsControllers.getblogsByCategory);
router.get('/blogs/categoryPagination/:category', blogsControllers.getblogsByCategoryPagination);



// Likes, Dislikes, Rate
router.put('/blogs/:blogId/like', authMiddleware, blogsControllers.likeblog);
router.put('/blogs/:blogId/dislike', authMiddleware, blogsControllers.dislikeblog);
router.put('/blogs/:blogId/rate', authMiddleware, blogsControllers.rateblog);

// get comments, post comments, reply comments
router.post('/blogs/:blogId/comment', authMiddleware, blogsControllers.addComment);
router.post('/blogs/:blogId/comment/:commentId/reply', authMiddleware, blogsControllers.addReply);
router.get('/blogs/:blogId/comments', authMiddleware, blogsControllers.getComments);

module.exports = router;
