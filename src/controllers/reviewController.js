const reviewModel = require('../models/reviewModel');
const bookModel = require('../models/bookModel');
const { isValidObjectId, isValidBody, isValidDate, isValidReviews, isValidPlainText } = require('../util/validator');

//addReview
const addReview = async (req, res) => {
    try {
        const bookId = req.params.bookId;
        let reqBody = req.body;
        reqBody.bookId = bookId;
        const { reviewedBy, reviewedAt, rating, review } = reqBody;

        if (!isValidBody(reqBody)) return res.status(400).send({ status: false, message: 'Please fill the data' });
        if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: `This BookId '${bookId}' is Invalid` })
        if (!isValidDate(reviewedAt)) return res.status(400).send({ status: false, message: `Your date ${reviewedAt} doest follow this date 'YYYY-MM-DD formate'` });
        if (!(rating > 0 && rating < 6)) return res.status(400).send({ status: false, message: 'lease rate between 1 to 5.' })
        if (!reviewedAt) return res.status(400).send({ status: false, message: `The reviewedAt Field is Required` });
        if (!rating) return res.status(400).send({ status: false, message: `The Rating Field is Required` });
        if (!review) return res.status(400).send({ status: false, message: `The review Field is Required` });
        if (reviewedBy === '') return res.status(400).send({ status: false, message: `The Reviewer's name is Required` });
        if (rating === 0 || rating === '') return res.status(400).send({ status: false, message: `The Rating Field cant be 0  or Empty` });

        const findBook = await bookModel.findById(bookId);
        if (!findBook) return res.status(404).send({ status: false, message: `Book Not Found` });
        if (findBook.isDeleted === true) return res.status(404).send({ status: false, message: `The book '${findBook.title}' has been Deleted ` });

        const result = await reviewModel.create(reqBody);
        await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: 1 } }, { new: true });

        const finalReview = await reviewModel.findOne({ _id: result._id }).select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        finalReview.reviewedAt = new Date();

        //response
        return res.status(201).send({ status: true, message: `New Review added Successfully to the Book'${findBook.title}'`, data: finalReview });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ status: false, message: err.message });
    }
};

//updateReview
const updateReview = async (req, res) => {
    try {
        const reqBody = req.body;
        const bookId = req.params.bookId;
        const reviewId = req.params.reviewId;
        const { reviewedBy, rating, review } = reqBody;
        const filter = {};

        if (!isValidBody(reqBody)) return res.status(400).send({ status: false, message: 'Please enter data.' });
        if (!bookId) return res.status(400).send({ status: false, message: 'bookId is required.' });
        if (!reviewId) return res.status(400).send({ status: false, message: 'reviewId is required.' });
        if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: `This '${bookId}' bookId isn't valid.` });
        if (!isValidObjectId(reviewId)) return res.status(400).send({ status: false, message: `This '${reviewId}' reviewId is invalid.` });

        if (reviewedBy)
            if (reviewedBy === '') return res.status(400).send({ status: false, message: `The Reviewer's name is Required` });
        if (!isValidPlainText(reviewedBy)) return res.status(400).send({ status: false, message: `This '${reviewedBy}' is invalid user.` });
        filter['reviewedBy'] = reviewedBy;

        if (rating)
            if (!(rating > 0 && rating < 6)) return res.status(400).send({ status: false, message: 'lease rate between 1 to 5.' })
        filter['rating'] = rating;

        if (review)
            if (!isValidReviews(review)) return res.status(400).send({ status: false, message: `This '${review}' is invalid review.` });
        filter['review'] = review;

        //finding book
        const exitsBook = await bookModel.findById(bookId);
        if (!exitsBook) return res.status(404).send({ status: false, message: `No book found by this bookId ${bookId}.` });
        if (exitsBook.isDeleted === true) return res.status(404).send({ status: false, message: `The book title '${exitsBook.title}' is already deleted.` });

        //finding review
        const exitsReview = await reviewModel.findById(reviewId);
        if (!exitsReview) return res.status(404).send({ status: false, message: `No review found by this ${reviewId} reviewId` })
        if (exitsReview.isDeleted === true) return res.status(404).send({ status: false, message: `The review '${exitsReview._id}' is already deleted.` });

        //review updation
        await reviewModel.findOneAndUpdate({ _id: reviewId }, { $set: filter }, { new: true });
        const reviewsData = await reviewModel.findOne({ _id: reviewId }).select({ bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 });

        //destructuring
        const { _id, title, excerpt, userId, category, subcategory, isDeleted, reviews, deletedAt, releaseAt, createdAt, updatedAt } = exitsBook;

        //response
        const data = { _id, title, excerpt, userId, category, subcategory, isDeleted, reviews, deletedAt, releaseAt, createdAt, updatedAt, reviewsData };
        return res.status(200).send({ status: true, message: 'Review updated successfully.', data: data });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ status: false, error: err.message });
    }
};

//deleteReview
const deleteReview = async (req, res) => {
    try {
        const bookId = req.params.bookId;
        const reviewId = req.params.reviewId;

        if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: ` '${bookId}' this bookId isn't valid.` });
        if (!isValidObjectId(reviewId)) return res.status(400).send({ status: false, message: ` '${reviewId}' this reviewId isn't valid.` });

        let existsBook = await bookModel.findById(bookId);
        if (!existsBook) return res.status(404).send({ status: true, message: `Book not found by '${bookId}' this id.` });
        if (existsBook.isDeleted === true) return res.status(404).send({ status: false, message: `The review '${existsBook.title}' is already deleted.` });

        if (existsBook.reviews < 1) return res.status(404).send({ status: true, message: ` '${existsBook.title} this book has no review.'` });

        const existsReview = await reviewModel.findOneAndUpdate({ _id: reviewId, bookId, isDeleted: false }, { $set: { isDeleted: true } });
        if (!existsReview) return res.status(404).send({ status: true, message: `No review found of this '${existsBook.title}' this book.` });

        await bookModel.findOneAndUpdate({ _id: bookId }, { reviews: existsBook.reviews - 1 });
        return res.status(200).send({ status: true, message: ` '${existsReview.review}' review deleted successfully.` });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ status: false, message: err.message });
    }
};

module.exports = { addReview, updateReview, deleteReview };
