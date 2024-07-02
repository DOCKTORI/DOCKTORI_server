const mongoose = require('mongoose');

const BookReferenceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  publisher: {
    type: String,
    required: true
  },
  isbn: {
    type: String,
    required: true
  },
  readStatus: {
    type: Boolean,
    default: false
  },
  likeStatus: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  remind: {
    type: [String],
    default: []
  },
  review: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
    default: 0
  }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String,
  },
  nickname: {
    type: String
  },
  salt: {
    type: String,
  },
  refreshToken: {
    type: String,
    default: null
  },
  goal: {
    type: String,
    default: '',
  },
  books: [BookReferenceSchema]
}, {
  collection: 'users',
  versionKey: false
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);