const studentModel = require("../models/studentModel");

const jwt = require('jsonwebtoken');

const showCourses = (req, res) => {

    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const secretKey = process.env.JWT_SECRET_KEY;
        var decodedToken = jwt.verify(token, secretKey);
        var studentId = decodedToken.userId;
    } catch (error) {
        return res.status(401).json({ login: 'failed, no user name OR password valid jwt', err: error });
    }
    
    studentModel.showCourses(studentId)
        .then(oneStudent => {
            if (!oneStudent[0].hasOwnProperty('studentCourses')) {
                return res.status(201).json({ search: 'no courses for this student' });
            }
            else {
                if (oneStudent[0].studentCourses.length == 0) {
                    return res.status(201).json({ search: 'no courses for this student' });
                }
                else {
                    return res.status(200).json({ search: 'student courses valid', courses: oneStudent[0].studentCourses });
                }

            }
        });
}


module.exports = {
    showCourses
}