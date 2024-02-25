const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const mongoConnection = process.env.MONGODB_CONNECTION;


async function showCourses(studentId) {
    const client = await MongoClient.connect(mongoConnection);
    const db = client.db();
    const oneUser = await db.collection("users").find( { _id: new ObjectId(String(studentId)) } ).toArray();
    client.close();
    return oneUser;
}


module.exports = {
    showCourses
}