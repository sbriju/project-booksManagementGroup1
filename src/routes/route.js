const express = require('express');
const router = express.Router();
const { createUser, login } = require('../controllers/userController.js');
const { createBook, getBooksQuery, getBookById, updateBookById, deleteBookById } = require('../controllers/bookController.js');
const { addReview, updateReview, deleteReview } = require('../controllers/reviewController');
const { auth } = require('../middleware/auth.js');

//user
router.post('/register', createUser);
router.post('/login', login);

//book
router.post('/books', auth, createBook);
router.get('/books', auth, getBooksQuery);
router.get('/books/:bookId', auth, getBookById);
router.put('/books/:bookId', auth, updateBookById);
router.delete('/books/:bookId', auth, deleteBookById);

//review
router.post('/books/:bookId/review', addReview);
router.put('/books/:bookId/review/:reviewId', updateReview);
router.delete('/books/:bookId/review/:reviewId', deleteReview);

module.exports = router; 
