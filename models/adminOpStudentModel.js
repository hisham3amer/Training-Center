const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require("bcrypt");

const mongoConnection = process.env.MONGODB_CONNECTION;


async function searchStudent(partOfStudentName) {
    const client = await MongoClient.connect(mongoConnection);
    const db = client.db();
    const oneUser = await db.collection("users")
                        .find({ fullName: { $regex: new RegExp(partOfStudentName, "i") } , role: 'student' })
                        .project({ fullName: 1 })
                        .toArray();
    client.close();
    return oneUser;
}


async function storeCourseDegree(createFormData) {
    studentId = createFormData.studentId;
    let studentCourses = {};
    studentCourses.courseId = createFormData.courseId;
    studentCourses.courseName = createFormData.courseName;
    studentCourses.degree = createFormData.degree;
    studentCourses.courseDate = createFormData.courseDate;

    const client = await MongoClient.connect(mongoConnection);
    const db = client.db();

    await db.collection("users")
                        .updateOne( { _id: new ObjectId(String(studentId)) } ,
                                    { $push: { studentCourses: studentCourses } },
                                    function(err, res){
                                            if(err) throw err;
                                            client.close();
                                            return {"operation": "success"};
                                        });
}


async function showCourses(studentId) {
    const client = await MongoClient.connect(mongoConnection);
    const db = client.db();
    const oneUser = await db.collection("users").find( { _id: new ObjectId(String(studentId)) } ).toArray();
    client.close();
    return oneUser;
}

async function resetStuPass(studentId, newPassword) {
    try {
        const hash = await bcrypt.hash(newPassword, 11);
        const client = await MongoClient.connect(mongoConnection);
        const db = client.db();

        const result = await db.collection("users").updateOne(
            { _id: new ObjectId(String(studentId)) },
            { $set: { password: hash } }
        );

        client.close();

        if (result.matchedCount === 1) {
            return { "RESET PASSWORD": "success" };
        } else {
            throw { "RESET PASSWORD": "User not found" };
        }
    } catch (error) {
        throw error;
    }
}

async function deleteCourseFromStudent(studentId, courseIdToDelete) {
    const client = await MongoClient.connect(mongoConnection);
    const db = client.db();

    try {
        const courseExists = await db.collection("users").findOne({
            _id: new ObjectId(String(studentId)),
            "studentCourses.courseId": courseIdToDelete
        });
        if (!courseExists) {
            console.log("Course not found for deletion.");
            return null; // Indicate that the course is not found
        }
        const result = await db.collection("users").updateOne(
            { _id: new ObjectId(String(studentId)) },
            { $pull: { studentCourses: { courseId: courseIdToDelete } } }
        );
        console.log("MongoDB Update Result:", result);
        client.close();

        if (result.matchedCount === 1) {
            return { "operation": "success" };
        } else {
            return null; // Indicate that deletion failed
        }
    } catch (error) {
        console.error("Model Error:", error);
        client.close();
        throw error;
    }
}
module.exports = {
    searchStudent,
    storeCourseDegree,
    showCourses,
    resetStuPass,
    deleteCourseFromStudent
}