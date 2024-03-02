const express = require('express');
const webRouter = express.Router();
const app = express();

/* ------------- controllers ------------------- */

const productController = require('../controllers/productController');

const authController = require('../controllers/authController');

const adminOpStudentController = require('../controllers/adminOpStudentController');

const adminOpCourseController = require('../controllers/adminOpCourseController');

const studentController = require('../controllers/studentController');

/* -------------- parse of form ------------------- */
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

const multer = require("multer");

const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/img/uploades/");
    },
    filename: (req, file, cb) => {
        if(file){
            cb(null, Date.now() + path.extname(file.originalname))
        }
    }
});

const upload = multer({
    storage: storage
});

/* -------------- route roles ------------------------ */

webRouter.post('/signin', (req, res) => {
    authController.signin(req, res);
});


//////////////   admin end Points   /////////

webRouter.post('/signup', authController.verifySigninAdmin, (req, res) => {
    authController.signup(req, res);
});

webRouter.post('/admin/student/search/:partOfStudentName', authController.verifySigninAdmin, (req, res) => {
    adminOpStudentController.searchStudent(req, res);
});

webRouter.post('/admin/course/store', authController.verifySigninAdmin, (req, res) => {
    adminOpCourseController.store(req, res);
});
webRouter.put('/admin/course/update/:courseId', authController.verifySigninAdmin, (req, res) => {
    adminOpCourseController.update(req, res);
});
webRouter.delete('/admin/course/destroy/:courseId', authController.verifySigninAdmin, (req, res) => {
    adminOpCourseController.destroy(req, res);
});

webRouter.post('/admin/student/storeCourseDegree', authController.verifySigninAdmin, (req, res) => {
    adminOpStudentController.storeCourseDegree(req, res);
});
webRouter.delete('/admin/student/deleteCourseFromStudent/:studentId/:courseIdToDelete', authController.verifySigninAdmin, (req, res) => {adminOpStudentController.deleteCourseFromStudent(req, res);
});

webRouter.post('/admin/student/showCourses/:studentId', authController.verifySigninAdmin, (req, res) => {
    adminOpStudentController.showCourses(req, res);
});
webRouter.put('/admin/student/resetStuPass/:studentId', authController.verifySigninAdmin, (req, res) => {
    adminOpStudentController.resetStuPass(req, res);
});

//////////////   students end Points   /////////

webRouter.post('/student/showCourses', authController.verifySigninStudent, (req, res) => {
    studentController.showCourses(req, res);
});
webRouter.put('/student/:studentId/resetPassword', authController.verifySigninStudent, (req, res) => {
    studentController.resetStuPassWithOldPassword(req, res);
});





/* webRouter.post('/testSignin', (req, res) => {
    res.send('you are signin and can get your request');
}); */

/* -------------------products route roles----------------------- */
/* webRouter.get('/products', (req, res) => {
    productController.index(req, res);
});
webRouter.get('/products/show/:id', (req, res) => {
    productController.show(req, res);
});
webRouter.get('/products/createForm', (req, res) => {
    productController.createForm(req, res);
}); */

/* ---****---- */
/* webRouter.post('/products/store', upload.single('photo'), (req, res) => {
    productController.store(req, res);
});

webRouter.get('/products/updateForm/:id', (req, res) => {
    productController.updateForm(req, res);
});
webRouter.post('/products/update', upload.single('photo'), (req, res) => {
    productController.update(req, res);
});
webRouter.get('/products/destroy/:id', (req, res) => {
    productController.destroy(req, res);
}); */
// add more route roles


module.exports = webRouter;