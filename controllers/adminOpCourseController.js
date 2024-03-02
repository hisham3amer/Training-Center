const adminOpCourseModel = require("../models/adminOpCourseModel");
const Joi = require('joi');

const store = (req, res) => {
    ///
    const schema = Joi.object({
        courseName: Joi
            .string()
            .min(5)
            .required(),
        courseCategory: Joi
            .string()
            .min(3)
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

    //////////
    adminOpCourseModel.checkCourseNameDuplication(req.body.courseName)
        .then(oneCourse => {
            if (oneCourse.length != 0) {
                return res.status(400).json({ errors: 'course name reserved .' });
            }
            else {
                adminOpCourseModel.store(req.body)
                    .then(error => {
                        if(error){
                            return res.status(500).json({ errors: 'server error .' });
                        }
                        else{
                            return res.status(200).json({ storeNewCourse: 'done' });
                        }                        
                    });                
            }
        });
    //

}
const update = (req, res) => {
    const courseId = req.params.courseId;

    // Validate request body using Joi schema
    const schema = Joi.object({
        courseName: Joi.string().min(5),
        courseCategory: Joi.string().min(3),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
        const formattedErrors = error.details.map((detail) => ({
            field: detail.context.label,
            message: detail.message,
        }));
        return res.status(400).json({ errors: formattedErrors });
    }

    // Check if the course with courseId exists
    adminOpCourseModel.checkCourseById(courseId)
        .then(existingCourse => {
            if (existingCourse.length === 0) {
                return res.status(404).json({ errors: 'Course not found.' });
            } else {
                // Check if the updated course name is reserved
                if (req.body.courseName && req.body.courseName !== existingCourse[0].courseName) {
                    adminOpCourseModel.checkCourseNameDuplication(req.body.courseName)
                        .then(duplicateCourse => {
                            if (duplicateCourse.length !== 0) {
                                return res.status(400).json({ errors: 'Course name reserved.' });
                            } else {
                                // Update the course
                                adminOpCourseModel.update(courseId, req.body)
                                    .then(error => {
                                        if (error) {
                                            return res.status(500).json({ errors: 'Server error.' });
                                        } else {
                                            return res.status(200).json({ updateCourse: 'Done' });
                                        }
                                    });
                            }
                        });
                } else {
                    // Update the course without changing the course name
                    adminOpCourseModel.update(courseId, req.body)
                        .then(error => {
                            if (error) {
                                return res.status(500).json({ errors: 'Server error.' });
                            } else {
                                return res.status(200).json({ updateCourse: 'Done' });
                            }
                        });
                }
            }
        });
};

const destroy = (req, res) => {
    const courseId = req.params.courseId;

    // Check if the course with courseId exists
    adminOpCourseModel.checkCourseById(courseId)
        .then(course => {
            if (course.length === 0) {
                return res.status(404).json({ errors: 'Course not found.' });
            } else {
                // Delete the course
                adminOpCourseModel.destroy(courseId)
                    .then(error => {
                        if (error) {
                            return res.status(500).json({ errors: 'Server error.' });
                        } else {
                            return res.status(200).json({ deleteCourse: 'Done' });
                        }
                    });
            }
        });
};

module.exports = {
    store,
    update,
    destroy
}