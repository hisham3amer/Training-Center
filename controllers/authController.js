const authModel = require("../models/authModel");
const Joi = require('joi');
const bcrypt = require("bcrypt");

const jwt = require('jsonwebtoken');


const signup = (req, res) => {
    const schema = Joi.object({
        fullName: Joi
            .string()
            .min(3)
            .required(),
        userName: Joi
            .string()
            .min(3)
            .required(),
        password: Joi
            .string()
            .required()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
        confirmPassword: Joi
            .ref('password'),
        role: Joi
            .string()
            .required()
            .valid('admin', 'student'),     // accepts only 'admin'  or  'student'
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const formattedErrors = error.details.map((detail) => ({
            field: detail.context.label,
            message: detail.message,
        }));
        return res.status(409).json({ errors: formattedErrors });
    }


    authModel.checkUserNameDuplication(req.body.userName)
        .then(oneUser => {
            if (oneUser.length != 0) {
                return res.status(409).json({ errors: 'user name reserved .' });
            }
            else {
                authModel.signup(req.body)
                    .then(err => {
                        //
                    });
                return res.status(200).json({ register: 'done' });
            }
        });
}


const signin = (req, res) => {
    const schema = Joi.object({
        userName: Joi
            .string()
            .min(3)
            .required(),
        password: Joi
            .string()
            .required()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const formattedErrors = error.details.map((detail) => ({
            field: detail.context.label,
            message: detail.message,
        }));
        return res.status(409).json({ errors: formattedErrors });
    }

    authModel.signin(req.body)
        .then(users => {
            if (users.length == 0) {
                return res.status(401).json({ login: 'failed, no user name valid' });
            }
            else {
                bcrypt.compare(req.body.password, users[0].password, function (err, result) {
                    if (err) {
                        //
                    }
                    if (result) {
                        // success sign in
                        const payload = {
                            userId: users[0]._id,
                            fullname: users[0].fullName,
                            role: users[0].role
                        };

                        const secretKey = process.env.JWT_SECRET_KEY;

                        const token = jwt.sign(payload, secretKey, { expiresIn: '300d' }); // 6000 = 6sec , 1d , 1h

                        return res.status(200).json({ login: 'done', token: token, role: users[0].role });
                    }
                    else {
                        return res.status(401).json({ login: 'failed, no password valid' });
                    }
                });
            }
        });
}


const verifySigninAdmin = (req, res, next) => {
    verifySignin(req, res, next, "admin");
}
const verifySigninStudent = (req, res, next) => {
    verifySignin(req, res, next, "student");
}

const verifySignin = (req, res, next, roleType) => {

    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const secretKey = process.env.JWT_SECRET_KEY;
        var decodedToken = jwt.verify(token, secretKey);
    } catch (error) {
        return res.status(401).json({ login: 'failed, no wrong OR no token sent' });
    }

    const id = decodedToken.userId;
    const fullname = decodedToken.fullname;
    const role = decodedToken.role;

    if (roleType != role) {
        return res.status(401).json({ login: 'failed, no user name OR password valid' });
    }

    authModel.verifySignin(id, role)
        .then(users => {
            if (users.length == 0) {
                return res.status(401).json({ login: 'failed, no wrong OR no token sent' });
            }
            else {
                next();
            }
        });
}


module.exports = {
    signup,
    signin,
    verifySigninAdmin,
    verifySigninStudent
}