const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const mongoConnection = process.env.MONGODB_CONNECTION;
const bcrypt = require("bcrypt");



async function showCourses(studentId) {
    const client = await MongoClient.connect(mongoConnection);
    const db = client.db();
    const oneUser = await db.collection("users").find( { _id: new ObjectId(String(studentId)) } ).toArray();
    client.close();
    return oneUser;
}

async function resetStuPassWithOldPassword(studentId, oldPassword, newPassword) {
    try {
        const client = await MongoClient.connect(mongoConnection);
        const db = client.db();

        // Retrieve the current hashed password from the database
        const currentStudent = await db.collection("users").findOne({ _id: new ObjectId(String(studentId)) });
        const currentHashedPassword = currentStudent.password;

        // Check if the old password matches the current hashed password
        const oldPasswordMatches = await bcrypt.compare(oldPassword, currentHashedPassword);

        if (oldPasswordMatches) {
            // Hash the new password and update the database
            const hash = await bcrypt.hash(newPassword, 11);
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
        } else {
            throw { "RESET PASSWORD": "Old password incorrect" };
        }
    } catch (error) {
        throw error;
    }
}


module.exports = {
    showCourses,
    resetStuPassWithOldPassword
}