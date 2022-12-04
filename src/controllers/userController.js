const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel.js');
const { isValidBody, isValidEnum, isValidNumber, isValidEmail, isValidPass, isValidStr } = require('../util/validator.js');

//createUser
const createUser = async (req, res) => {
  try {
    const reqBody = req.body;
    const { title, name, phone, email, password, address } = reqBody;

    if (!isValidBody(reqBody)) return res.status(400).send({ status: false, message: 'Please fill the data' })
    if (!title) return res.status(400).send({ status: false, message: 'title is  mandatory.' });
    if (!name) return res.status(400).send({ status: false, message: 'name is  mandatory.' });
    if (!address) return res.status(400).send({ status: false, message: 'address is  mandatory.' });
    if (!phone) return res.status(400).send({ status: false, message: 'phone is  mandatory.' });
    if (!email) return res.status(400).send({ status: false, message: 'email is  mandatory.' })
    if (!password) return res.status(400).send({ status: false, message: 'password is  mandatory.' });

    if (!isValidEnum(title)) return res.status(400).send({ status: false, message: 'title should be of Mr/Mrs/Miss.' });
    if (!isValidStr(name)) return res.status(400).send({ status: false, message: 'name should be only string.' });
    if (!isValidNumber(phone)) return res.status(400).send({ status: false, message: 'Please enter 10 digit phone number.' });
    if (!isValidEmail(email)) return res.status(400).send({ status: false, message: 'Please enter a valid email.' })
    if (!isValidPass(password)) return res.status(400).send({ status: false, message: 'Password should be 8-15 char & use 0-9,A-Z,a-z & special char this combination.' });

    if (typeof address !== 'object' || Array.isArray(address) || Object.keys(address).length === 0)
      return res.status(400).send({ status: false, message: 'address should be an object' })

    const pin = address.pincode.length;
    if (pin > 6 || pin < 6) return res.status(400).send({ status: false, message: 'pincode should be 6 dist' });

    //existsEmail & existNumber
    const exitsPhone = await userModel.findOne({ phone });
    if (exitsPhone) return res.status(400).send({ status: false, message: `This '${phone}' phone no is already registered.` });
    const exitsEmail = await userModel.findOne({ email });
    if (exitsEmail) return res.status(400).send({ status: false, message: `This '${email}' Email-Id is already registered.` });

    //newUser
    const newUser = await userModel.create(reqBody);
    return res.status(201).send({ status: true, message: `'${name}' user created Successfully.`, data: newUser });
  } catch (err) {
    console.log(err)
    return res.status(500).send({ status: false, message: err.message });
  }
};

//login
const login = async (req, res) => {
  try {
    const reqBody = req.body
    const { email, password } = reqBody

    if (!isValidBody(reqBody)) return res.status(400).send({ status: false, message: 'Please fill the data' })
    if (!email) return res.status(400).send({ status: false, message: 'Email is Required.' });
    if (!password) return res.status(400).send({ status: false, message: 'Password Required.' });

    if (!isValidEmail(email)) return res.status(400).send({ status: false, message: `This '${email}' Email-Id is invalid.` });
    if (!isValidPass(password)) return res.status(400).send({ status: false, message: 'Password should be 8-15 char & use 0-9,A-Z,a-z & special char this combination.', });

    //exitsUser
    const existUser = await userModel.findOne({ email, password });
    if (!existUser) return res.status(401).send({ status: false, message: 'Please register first.' });

    //token generation
    const payload = { userId: existUser._id, iat: Math.floor(Date.now() / 1000) };
    const token = jwt.sign(payload, 'group1', { expiresIn: '365d' });

    //response
    return res.status(200).send({ status: true, message: 'Login Successful.', token: token, exp: payload.exp, });
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createUser, login };
