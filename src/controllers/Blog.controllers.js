// Controller.blogs.js

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Blog = require('../models/Blog.model');
const User = require('../models/user');
const { isAborted } = require('zod');

const dataFilePath = path.join(__dirname, '../data.json');


// Function to update data.json
const updateDataFile = async () => {
  try {
    const blogs = await Blog.find();
    fs.writeFileSync(dataFilePath, JSON.stringify(blogs, null, 2), 'utf8');
    console.log('data.json file has been updated');
  } catch (error) {
    console.error('Error updating data.json:', error.message);
  }
};


// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Directory to store files
  },
 // multer filename function
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
}

});
const upload = multer({ storage });


// get All blogs
const getAllblogs = async (req, res) => {
  try {
    const blog = await Blog.find().sort({_id: -1});
    console.log("thi is coming from", blog)
    if(!blog){
      return res.status(404).json({ msg: "blog not found" });
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error(error);
  }
}

const getblogsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    let filter = {};
    let sort = {};

    switch (category) {
      case 'popular':
        sort = { likes: -1 };
        break;
      case 'highRated':
        sort = { averageRating: -1 };
        break;
      case 'recent':
        sort = { _id: -1 };
        break;
      default:
        filter = { category };
        sort = { _id: -1 };
        break;
    }

    const blogs = await Blog.find(filter).sort(sort);

    if (!blogs.length) {
      return res.status(404).json({ message: `No blogs found for category: ${category}` });
    }

    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs by category", error: error.message });
  }
};

const getblogsByCategoryPagination = async (req, res) => {
  try {
    const category = req.params.category;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {};
    let sort = {};

    switch (category) {
      case 'popular':
        sort = { likes: -1 };
        break;
      case 'highRated':
        sort = { averageRating: -1 };
        break;
      case 'recent':
        sort = { _id: -1 };
        break;
      default:
        filter = { category };
        sort = { _id: -1 };
        break;
    }

    const blogs = await Blog.find(filter).sort(sort).skip(skip).limit(limit);
    const totalItems = await Blog.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    if (!blogs.length) {
      return res.status(404).json({ message: `No blogs found for category: ${category}` });
    }

    res.status(200).json({
      blogs,
      totalItems,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs by category", error: error.message });
  }
};

// blogs using query(limit, page)
const blogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let response = await Blog.find().sort({ _id: -1 }); 

    // Apply skip and limit for pagination
    response = response.slice(skip, skip + limit);

    // Count total documents 
    const totalItems = await Blog.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);

    if (!response.length) {
      return res.status(400).json({ msg: "blog not found" });
    }

    res.status(200).json({
      response,
      totalItems,
      totalPages,
      currentPage: page,
    });

  } catch (error) {
    console.log("blogs", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// get blogs by id(single blog)

const getblogsById = async (req, res) => {
  try {
    const id = req.params.id
    const blog = await Blog.findOne({_id: id});

    if(!blog){
      return res.status(404).json({message: "No blog found with this ID"});
    }

    console.log(blog)
    res.status(200).json({blog});
  } catch (error) {
    console.log("blogs", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


 // update blogs using id
const updateblogById = async (req, res) =>{
  try {
    const id = req.params.id;
    const updateblog = req.body; 
    const updatedblog = await blog.updateOne({_id: id}, {$set:updateblog});

    if(!updatedblog){
      return res.status(404).json({ message: "No blog found with this ID" });
    } 

   await updateDataFile();

   res.status(200).json({ message: "blog updated successfully", updatedblog });

  } catch (error) {
    console.log("blogs", error);
  }
}

// add blogs
const addblogs = async (req, res) => {
  try {
    const { title, content, author, pdf, category } = req.body;
    let {image, thumbnailImage} = req.body;
    const titleExist = await Blog.findOne({ title });

    if (titleExist) {
      return res.status(400).json({ msg: "This blog already exists with this title" });
    }

    if (req.files) {
     
      if (req.files.image) {
        image = `/uploads/${req.files.image[0].filename}`;
      }
      if (req.files.thumbnailImage) {
        thumbnailImage = `/uploads/${req.files.thumbnailImage[0].filename}`;
      }
    }

    // Add the new blog to the database
    const addblog = await Blog.create({
       title, content, author, image, thumbnailImage, pdf, category
      });

   
    await updateDataFile();

    res.status(200).json({ msg: "Your new blog has been added successfully", addblog });
  } catch (error) {
    console.log("Error in adding a blog from controllers", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// delete blogs by id
const deleteblog = async (req, res) => {
  try {
    const id = req.params.id;

    // Delete blog from MongoDB
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return res.status(404).json({ message: "No blog found with this ID" });
    }

     // Check if the blog has an image associated
     if (blog.image) {
      const imagePath = path.join(__dirname, '..', blog.image);

      // Delete the image file from the filesystem
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(`Error deleting image file: ${err.message}`);
          // Optionally, log or handle this case
        } else {
          console.log(`Image file ${imagePath} deleted successfully.`);
        }
      });
    }

    await updateDataFile(); 

    res.status(200).json({ message: "blog deleted successfully" });
  } catch (error) {
    console.log("Error in deleting a blog", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Like a blog
const likeblog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user._id;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: 'blog not found' });
    }

    // if the user already liked the blog
    if (blog.likes.includes(userId)) {
      return res.status(400).json({ message: 'You already liked this blog' });
    }

    // Remove from dislikes if the user previously disliked
    blog.dislikes = blog.dislikes.filter(id => id.toString() !== userId.toString());
    blog.likes.push(userId);

    const updatedblog = await Blog.findById(blogId).populate('likes', 'username email');
    await blog.save();
    await updateDataFile();

    res.status(200).json({ message: 'blog liked',likes: updatedblog.likes, likes: blog.likes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Dislike a blog
const dislikeblog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user._id;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: 'blog not found' });
    }

    //  if the user already disliked the blog
    if (blog.dislikes.includes(userId)) {
      return res.status(400).json({ message: 'You already disliked this blog' });
    }

    // Remove from likes if the user previously liked
    blog.likes = blog.likes.filter(id => id.toString() !== userId.toString());
    blog.dislikes.push(userId);

    await blog.save();
    await updateDataFile();

    res.status(200).json({ message: 'blog disliked', dislikes: blog.dislikes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Rate a blog
const rateblog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { rating } = req.body;
    const userId = req.user._id;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: 'blog not found' });
    }

    // Check if user has already rated the blog
    const existingRating = blog.ratings.find(r => r.userId.toString() === userId.toString());

    if (existingRating) {
      existingRating.rating = rating;
    } else {
      blog.ratings.push({ userId, rating });
    }

    // Calculate the new average rating
    const totalRatings = blog.ratings.length;
    const sumRatings = blog.ratings.reduce((sum, r) => sum + r.rating, 0);
    blog.averageRating = parseFloat((sumRatings / totalRatings).toFixed(1));

    await blog.save();
    await updateDataFile();

    res.status(200).json({ message: 'blog rated successfully', averageRating: blog.averageRating, ratings: blog.ratings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const addComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Comment content cannot be empty' });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'blog not found' });
    }

    const user = await User.findById(userId);
    const comment = { userId, content, email: user.email };

    blog.comments.push(comment);
    await blog.save();
    await updateDataFile();

    res.status(201).json({ message: 'Comment added', comments: blog.comments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const addReply = async (req, res) => {
  try {
    const { blogId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Reply content cannot be empty' });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'blog not found' });
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const user = await User.findById(userId);
    const reply = { userId, content, email: user.email };

    comment.replies.push(reply);
    await blog.save();
    await updateDataFile();

    res.status(201).json({ message: 'Reply added', replies: comment.replies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get all comments
const getComments = async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId)
      .populate('comments.userId', 'username email')
      .populate('comments.replies.userId', 'username email');

    if (!blog) {
      return res.status(404).json({ message: 'blog not found' });
    }

    res.status(200).json({ comments: blog.comments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




module.exports = {upload, getAllblogs, blogs, addblogs, getblogsById, updateblogById, deleteblog, likeblog, dislikeblog, rateblog, addComment, getComments, addReply, getblogsByCategory, getblogsByCategoryPagination};