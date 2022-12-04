const mongoose = require('mongoose');
const moment = require('moment');

//isValidBody
const isValidBody = (data) => {
    if (Object.keys(data).length > 0)
        return true
    return false
};

//title(Enum)
const isValidEnum = (title) => {
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
};

//name(str)
const isValidStr = (name) => {
    const regex = /^[A-Z a-z]{2,}$/.test(name)
    return regex
};

//phone
const isValidNumber = (phone) => {
    let regex = /^[6-9]{1}[0-9]{9}$/.test(phone)
    return regex
};

//email
const isValidEmail = (email) => {
    const regex = /^([a-zA-Z0-9_.]+@[a-z]+\.[a-z]{2,3})?$/.test(email)
    return regex
};

//password
const isValidPass = (pass) => {
    const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(pass)
    return regex
};

//mongoDbId
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id)
};

//isTitleAny
const isValidTitle = (title) => {
    if (typeof title == "string" && title.trim().length != 0 && title.match(/^[a-z A-Z 0-9,.-?%!&]{2,}$/i))
        return true
    return false
};

//plainText
const isValidPlainText = (plainText) => {
    if ((typeof plainText == "string" && plainText.trim().length != 0 && plainText.match(/^[A-Z a-z 0-9,.-?%!&]{2,}$/)))
        return true
    return false
};

//validText
const isValidText = (text) => {
    if (typeof text == "string" && text.trim().length != 0 && text.match(/^[a-z A-Z 0-9,.-?!@#$%&()]{2,}$/i))
        return true
    return false
};

//ISBN
const isValidIsbn = (value) => {
    const isbn = value.trim()
    if (typeof isbn == "string" && isbn.match(/^(?=(?:\D*\d){13}(?:(?:\D*\d){3})?$)[\d-]+$/))
        return true
    return false
};

//isValidDate
const isValidDate = (date) => {
    const value = date
    const check = moment(value, 'YYYY-MM-DD', true).isValid();
    return check
};

//reviews
const isValidReviews = (review) => {
    const rev = review.trim()
    if (typeof rev == "string" && rev.trim().length != 0)
        return true
    return false
};

//isValidSub
const isValidSub = (text) => {
    if (typeof text == "string" && text.trim().length != 0 && text.match(/^[a-z A-Z]{2,}$/i))
        return true
    return false
};

module.exports = { isValidEnum, isValidBody, isValidStr, isValidNumber, isValidEmail, isValidPass, isValidObjectId, isValidPlainText, isValidTitle, isValidText, isValidIsbn, isValidDate, isValidReviews, isValidSub };
