const bookModel = require('../models/bookModel');
const userModel = require('../models/userModel');
const reviewModel = require('../models/reviewModel');
const { isValidBody, isValidObjectId, isValidTitle, isValidPlainText, isValidText, isValidIsbn, isValidDate, isValidSub } = require('../util/validator');

//createBook
const createBook = async (req, res) => {
  try {
    const reqBody = req.body;
    const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = reqBody;

    if (!isValidBody(reqBody)) return res.status(400).send({ status: false, message: 'Please fill the data.' });
    if (!title) return res.status(400).send({ status: false, message: 'title is required.' });
    if (!excerpt) return res.status(400).send({ status: false, message: 'excerpt is required.' });
    if (!userId) return res.status(400).send({ status: false, message: 'userId is required.' });
    if (!ISBN) return res.status(400).send({ status: false, message: 'ISBN is required.' });
    if (!category) return res.status(400).send({ status: false, message: 'category is required.' });
    if (!subcategory) return res.status(400).send({ status: false, message: 'subcategory is required.' });
    if (!releasedAt) return res.status(400).send({ status: false, message: 'releasedAt is required.' })

    if (!isValidTitle(title)) return res.status(400).send({ status: false, message: `'${title}' this title isn't valid.` });
    if (!isValidText(excerpt)) return res.status(400).send({ status: false, message: `'${excerpt}' this excerpt isn't valid.` });
    if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: `'${userId}' this userId isn't valid.` });
    if (!isValidIsbn(ISBN)) return res.status(400).send({ status: false, message: `'${ISBN}' this ISBN isn't valid.` });
    if (!isValidPlainText(category)) return res.status(400).send({ status: false, message: `'${category}' this category isn't valid.` });
    if (!isValidDate(releasedAt)) return res.status(400).send({ status: false, message: `Please use 'YYYY-MM-DD' this format.` });

    if (typeof subcategory === 'string') {
      if (!isValidSub(subcategory)) return res.status(400).send({ status: false, message: ` '${subcategory}' this subcategory isn't valid.` });
    } else if (typeof subcategory === 'number') {
      return res.status(400).send({ status: false, message: ` '${subcategory}' this subcategory isn't valid.` });
    } else {
      subcategory.map(x => {
        if (!isValidSub(x)) return res.status(400).send({ status: false, message: ` '${x}' this subcategory isn't valid.` });
      });
    };

    // authorization
    if (req.user != userId) return res.status(403).send({ status: false, message: `This '${userId}' person is Unauthorized.` });

    //existUser
    const existUser = await userModel.findById(userId);
    if (!existUser) return res.status(404).send({ status: false, message: `User not found by '${userId}' this id.` });

    //existTitle
    const existTitle = await bookModel.findOne({ title });
    if (existTitle) return res.status(400).send({ status: false, message: `'${title}' already exists.` });

    //existISBN
    const existISBN = await bookModel.findOne({ ISBN });
    if (existISBN) return res.status(400).send({ status: false, message: `'${ISBN}' already exists.` });

    //bookCreation
    const newBook = await bookModel.create(reqBody);
    return res.status(201).send({ status: true, message: `'${title}' book created successfully.`, data: newBook });
  }
  catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, error: err.message });
  }
};

//getBooksQuery
const getBooksQuery = async (req, res) => {
  try {
    const reqBody = req.query;
    const { userId, category, subcategory } = reqBody;

    if (userId)
      if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: `This '${userId}' userId is Invalid` });
    if (category)
      if (!isValidPlainText(category)) return res.status(400).send({ status: false, message: `'${category}' this category isn't valid.` });
    if (subcategory)
      if (!isValidSub(subcategory)) return res.status(400).send({ status: false, message: ` '${subcategory}' this subcategory isn't valid.` });
    
    //existsTitle
    const existsTitle = await bookModel.findOne({ title })
    if (existsTitle) { return res.status(404).send({ status: false, message: `This '${title}' title is already exists.` }) }

    //existsISBN
    const existsISBN = await bookModel.findOne({ ISBN })
    if (existsISBN) { return res.status(404).send({ status: false, message: `This '${ISBN}' ISBN is already exists.` }) }

    const books = await bookModel.find({ $and: [{ isDeleted: false }, reqBody] }).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 });

    if (books.length === 0) return res.status(404).send({ status: false, message: `Book not found.` });
    return res.status(200).send({ status: true, message: 'Books list', data: books });

  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, error: err.message });
  }
};

//getBookById
const getBookById = async (req, res) => {
  try {
    const bookId = req.params.bookId

    if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: `This '${bookId}' bookId is Invalid` });

    //finding Book
    const foundBook = await bookModel.findById(bookId).select({ __v: 0, ISBN: 0 });

    if (foundBook.isDeleted === true)
      return res.status(404).send({ status: false, message: `The Book Title '${foundBook.title}' has been Deleted` });

    //existsReview
    const existsReview = await reviewModel.find({ bookId }).select({ isDelete: 0, createdAt: 0, updatedAt: 0, isDeleted: 0, __v: 0 });

    foundBook._doc.reviewsData = existsReview;
    return res.status(200).send({ status: true, message: 'Books details with reviews.', data: foundBook });
  }
  catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, error: err.message });
  }
};

//updateBookById
const updateBookById = async (req, res) => {
  try {
    const reqBody = req.body;
    const bookId = req.params.bookId;
    const { title, excerpt, ISBN, releasedAt } = reqBody;

    if (!isValidBody(reqBody)) return res.status(400).send({ status: false, message: 'Please fill the data.' });
    if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: ` '${bookId}' this book id isn't valid.` });

    //existsBook
    const existsBook = await bookModel.findById(bookId);
    if (!existsBook) return res.status(404).send({ status: false, message: `Book not found by '${bookId}' this id.` });

    //authorization
    if (req.user != existsBook.userId)
      return res.status(403).send({ status: false, message: `This '${req.user}' person is Unauthorized.` });

    if (existsBook.isDeleted === true)
      return res.status(400).send({ status: false, message: `This '${bookId}' book is already deleted.` });
    
    if (excerpt)
      if (!isValidText(excerpt)) return res.status(400).send({ status: false, message: ` '${excerpt}'excerpt isn't valid.` });
    if (releasedAt)
      if (!isValidDate(releasedAt)) return res.status(400).send({ status: false, message: `Please use 'YYYY-MM-DD' this format.` });
    
    if (title) {
      if (!isValidTitle(title)) return res.status(400).send({ status: false, message: ` '${title}' this title isn't valid.` });
      const existsTitle = await bookModel.findOne({ title })
      if (existsTitle) return res.status(400).send({ status: false, message: ` '${title}' this title already exists.` });
    }
    if (ISBN) {
      if (!isValidIsbn(ISBN)) return res.status(400).send({ status: false, message: ` '${ISBN}'ISBN isn't valid.` });
      let existsISBN = await bookModel.findOne({ ISBN })
      if (existsISBN) return res.status(400).send({ status: false, message: ` '${title}' this ISBN already exists.` });
    }

    //book updation
    const updatedBook = await bookModel.findByIdAndUpdate({ _id: bookId }, { $set: reqBody }, { new: true });
    return res.status(200).send({ status: true, message: ` '${title}' book is updated successfully.`, data: updatedBook });
  }
  catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, error: err.message });
  }
};

//deleteBookById
const deleteBookById = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    if (!bookId) return res.status(400).send({ status: false, message: 'bookId is required on the path params.' });
    if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: `Book Id ${bookId} in params is Invalid.` })
    const existsBook = await bookModel.findById(bookId);
    if (!existsBook) return res.status(404).send({ status: false, message: 'Book not found' });

    //authorization
    if (req.user != existsBook.userId) return res.status(403).send({ status: false, message: `This '${req.user}' person is Unauthorized.` });

    if (existsBook.isDeleted === true) return res.status(404).send({ status: false, message: ` '${existsBook.title}' is already Deleted.` });

    //deletion
    await bookModel.findByIdAndUpdate({ _id: bookId }, { $set: { isDeleted: true } }, { new: true });
    return res.status(200).send({ status: true, message: ` '${existsBook.title}' book deleted successfully.` });
  }
  catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, error: err.message });
  }
};

module.exports = { createBook, getBooksQuery, getBookById, updateBookById, deleteBookById };
