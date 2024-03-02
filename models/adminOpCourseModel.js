const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const mongoConnection = process.env.MONGODB_CONNECTION;

async function checkCourseById(courseId) {
    const client = await MongoClient.connect(mongoConnection);
    const db = client.db();

    const result = await db.collection("courses").findOne({ _id: new ObjectId(String(courseId)) });
    
    client.close();
    return result ? [result] : [];
}

async function checkCourseNameDuplication(courseName) {
    const client = await MongoClient.connect(mongoConnection);
    const db = client.db();
    const oneCourse = await db.collection("courses").find({ courseName: courseName }).toArray();
    client.close();
    return oneCourse;
}

async function store(createFormData) {
    let doc = {};
    doc.courseName = createFormData.courseName;
    doc.courseCategory = createFormData.courseCategory;

    const client = await MongoClient.connect(mongoConnection);
    const db = client.db();

    await db.collection("courses").insertOne(doc, function(err, res){
        if(err) throw err;
        client.close();
        return {"operation": "success"};
    });
}
async function update(courseId, updateFormData) {
    const client = await MongoClient.connect(mongoConnection);
    const db = client.db();
    let updatedDoc  = {};

    if (updateFormData.courseName) {
        updatedDoc.courseName = updateFormData.courseName;
    }
    if (updateFormData.courseCategory) {
        updatedDoc.courseCategory = updateFormData.courseCategory;
    }

    await db.collection("courses").updateOne(
        { _id: new ObjectId(String(courseId)) },
        { $set: updatedDoc }, function(err, res){
        if(err) throw err;
        client.close();
        return {"operation": "success"};
    });
}
async function destroy(courseId) {
    const client = await MongoClient.connect(mongoConnection);
    const db = client.db();

    try {
        const result = await db.collection("courses").deleteOne({ _id: new ObjectId(String(courseId)) });
        client.close();
        if (result.deletedCount === 1) {
            return null; // Success, no error
        } else {
            throw new Error("Delete failed");
        }
    } catch (error) {
        client.close();
        throw error;
    }
}


module.exports = {
    checkCourseById,
    checkCourseNameDuplication,
    store,
    update,
    destroy
}