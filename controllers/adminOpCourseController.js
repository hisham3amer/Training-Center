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

module.exports = {
    store
}