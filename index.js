const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = 4000;
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.xrhyseu.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();
    const db = client.db("course-db");
    const coursesCollection = db.collection("courses");
    const enrolledCoursesCollection = db.collection("my-enrolled-courses");
    // all course
    app.get("/courses", async (req, res) => {
      const result = await coursesCollection.find().toArray();
      res.send(result);
    });

    // my course
    app.get("/my-course", async (req, res) => {
      const email = req.query.email;
      const result = await coursesCollection
        .find({ created_by: email })
        .toArray();
      res.send(result);
    });

    // latest 6 course
    app.get("/latest-course", async (req, res) => {
      const result = await coursesCollection
        .find()
        .sort({ created_ad: "desc" })
        .limit(6)
        .toArray();
      console.log(result);
      res.send(result);
    });

    // course detail
    app.get("/courses/:id", async (req, res) => {
      const { id } = req.params;
      const result = await coursesCollection.findOne({ _id: new ObjectId(id) });
      res.send({
        success: true,
        result,
      });
    });

    // my added course
    app.post("/courses", async (req, res) => {
      const data = req.body;
      const result = await coursesCollection.insertOne(data);
      res.send({
        success: true,
        result,
      });
    });

    // my enrolled courses
    app.post("/enrolled-courses", async (req, res) => {
      const data = req.body;
      const result = await enrolledCoursesCollection.insertOne(data);
      res.send(result);
    });

    app.get("/my-enrolled-courses", async (req, res) => {
      const email = req.query.email;
      const result = await enrolledCoursesCollection
        .find({ enrolled_by: email })
        .toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
