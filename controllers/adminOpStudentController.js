const adminOpStudentModel = require("../models/adminOpStudentModel");
const Joi = require('joi');

const searchStudent = (req, res) => {
    partOfStudentName = req.params['partOfStudentName'];

    adminOpStudentModel.searchStudent(partOfStudentName)
        .then(users => {
            if (users.length == 0) {
                return res.status(201).json({ search: 'no user', users: [] });
            }
            else {
                return res.status(200).json({ search: 'search done with valid users', users: users });
            }
        });
}

const storeCourseDegree = (req, res) => {
    ///
    const schema = Joi.object({
        studentId: Joi
            .string()
            .required(),
        courseId: Joi
            .string()
            .required(),
        courseName: Joi
            .string()
            .required(),
        degree: Joi
            .number()
            .required(),
        courseDate: Joi
            .date()
            .required(),
    });
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const formattedErrors = error.details.map((detail) => ({
            field: detail.context.label,
            message: detail.message,
        }));
        return res.status(400).json({ errors: formattedErrors });
    }

    adminOpStudentModel.storeCourseDegree(req.body)
        .then(error => {
            //
        });
    return res.status(200).json({ storeNewCourseToStudent: 'done' });
}

const showCourses = (req, res) => {
    const studentId = req.params['studentId'];
    adminOpStudentModel.showCourses(studentId)
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
const resetStuPass = async (req, res) => {
    const studentId = req.params.studentId;
    const newPassword = req.body.newPassword;

    try {
        const result = await adminOpStudentModel.resetStuPass(studentId, newPassword);

        if (result["RESET PASSWORD"] === 'success') {
            res.status(200).json({ resetStudentPass: 'Password updated successfully' });
        } else {
            res.status(404).json({ resetStudentPass: 'User not found or password update failed' });
        }
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ resetStudentPass: 'Internal server error' });
    }
};

const deleteCourseFromStudent = (req, res) => {
    const studentId = req.params.studentId;
    const courseIdToDelete = req.params.courseIdToDelete;

    adminOpStudentModel.deleteCourseFromStudent(studentId, courseIdToDelete)
        .then(result => {
            if (result && result.operation === 'success') {
                console.log(result, result.operation)
                return res.status(200).json({ deleteCourseFromStudent: 'Done' });
            } else {
                return res.status(404).json({ errors: 'Course not found for the student or deletion failed' });
            }
        })
        .catch(error => {
            console.error("Controller Error:", error);
            return res.status(500).json({ errors: 'Server error' });
        });
};
module.exports = {
    searchStudent,
    storeCourseDegree,
    showCourses,
    resetStuPass,
    deleteCourseFromStudent
}