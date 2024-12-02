// Updated Books model
const { model, Schema } = require('mongoose');


const booksSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content:{
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true
  },
  thumbnailImage: {
    type: String,
    required: true
  },
  pdf: {
    type: Array,
  },
  category: [String],
  likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
  }],
  dislikes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
  }],
  ratings: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  comments: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    email: { 
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    replies: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      email: {
        type: String,
        required: true
      },
      content: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const blog = model('Blogs', booksSchema);
module.exports = blog;