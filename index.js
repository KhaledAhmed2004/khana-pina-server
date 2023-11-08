const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Configuration
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vx7njxc.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// MongoDB Connection
async function run() {
  try {
    // Define the testimonialCollection
    const testimonialCollection = client
      .db("restaurant")
      .collection("testimonial");

    //   define the purchaseOrders
    const purchaseOrdersCollection = client
      .db("restaurant")
      .collection("purchaseOrders");

    // Define the foodItemCollection
    const foodItemsCollection = client.db("restaurant").collection("foodItems");

    app.get("/testimonial", async (req, res) => {
      try {
        const result = await testimonialCollection.find().toArray();
        res.json(result);
      } catch (error) {
        console.log("Error fetching testimonials:", error);
      }
    });

    app.post("/purchaseOrders", async (req, res) => {
      try {
        const order = req.body;
        console.log(order);
        const result = await purchaseOrdersCollection.insertOne(order);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.post("/foodItems", async (req, res) => {
      try {
        const body = req.body;
        console.log(body);
        const result = await foodItemsCollection.insertOne(body);
        res.send(result);
      } catch (error) {
        console.log("Error processing the JSON data:", error);
      }
    });
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
}
run().catch(console.dir);

// Define a route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
