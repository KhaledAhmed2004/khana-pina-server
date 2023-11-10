const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cookieParser = require("cookie-parser");
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

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
    // middleWere

    const verify = (req, res, next) => {
      const token = req?.cookies?.token;
      console.log("verify :", token);
      if (!token) {
        return res.status(401).send({ message: "unauthorized access" });
      }
      jwt.verify(token, "khaled", (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "unauthorized access" });
        }
        console.log("verify decoded:", decoded);
        req.user = decoded;
        next();
      });
    };

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

    app.get("/api/v1/testimonial", async (req, res) => {
      try {
        const result = await testimonialCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.log("Error fetching testimonials:", error);
      }
    });

    app.post("/api/v1/jwt", async (req, res) => {
      const user = req.body;
      console.log("user form jwt:", user);
      const token = jwt.sign(user, "khaled", { expiresIn: "1h" });
      console.log("token for jwt:", token);
      //   res.send(token);
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true, token });
    });

    // app.post("/api/v1/cookie", (req, res) => {
    //   res
    //     .cookie("testCookie", "testValue", {
    //       httpOnly: true,
    //       secure: false,
    //       sameSite: "none",
    //     })
    //     .send("Cookie set successfully");
    // });

    app.post("/api/v1/purchaseOrders", async (req, res) => {
      try {
        const order = req.body;
        console.log(order);
        const result = await purchaseOrdersCollection.insertOne(order);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.get("/api/v1/purchaseOrders", verify, async (req, res) => {
      try {
        const queryEmail = req.query.email;
        const tokenEmail = req.user.email;
        if (queryEmail !== tokenEmail) {
          return res.status(403).send({ massage: "forbidden assess" });
        }
        let query = {};
        if (queryEmail) {
          query.email = queryEmail;
        }
        const result = await purchaseOrdersCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.delete("/api/v1/purchaseOrders/:orderId", async (req, res) => {
      try {
        const { orderId } = req.params;
        console.log(orderId);
        const query = { _id: new ObjectId(orderId) };
        const result = await purchaseOrdersCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.post("/api/v1/foodItems", async (req, res) => {
      try {
        const body = req.body;
        console.log(body);
        const result = await foodItemsCollection.insertOne(body);
        res.send(result);
      } catch (error) {
        console.log("Error processing the JSON data:", error);
      }
    });
    app.get("/api/v1/foodItems", async (req, res) => {
      try {
        const result = await foodItemsCollection.find().toArray();
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
