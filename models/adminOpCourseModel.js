const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const mongoConnection = process.env.MONGODB_CONNECTION;


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


module.exports = {
    checkCourseNameDuplication,
    store,
}