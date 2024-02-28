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
// async function resetStuPass(studentId, newPassword) {
//     bcrypt.hash(newPassword.password, 11, async (err, hash) => {
//         if (err) {
//             //
//         }
//         else {
//             const client = await MongoClient.connect(mongoConnection);
//             const db = client.db();
//             await db.collection("users").updateOne((
//                 { _id: new ObjectID(studentId) },
//                 { $set: { password: hash } }), function (err, res) {
//                 if (err) throw err;
//                 client.close();
//                 return { "RESET PASSWORD": "success" };
//             });
//         }
//     });
// }
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

module.exports = {
    searchStudent,
    storeCourseDegree,
    showCourses,
    resetStuPass
}