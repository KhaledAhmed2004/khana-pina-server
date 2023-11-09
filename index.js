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
    // middleWere

    const verify = async (req, res, next) => {
      const token = req.cookies?.token;
      console.log(token);
      if (!token) {
        return res.status(401).send({ status: "unauthorized access" });
      }
      next();
    };

    // const verify = (req, res, next) => {
    //   const token = req.cookies.token;
    //   console.log(token);

    //   if (!token) {
    //     return res.status(401).send({ message: "You are not authorized" });
    //   }

    //   jwt.verify(token, "shhhhh", function (err, decoded) {
    //     if (err) {
    //       return res.status(401).send({ message: "You are not authorized" });
    //     }
    //     next();
    //   });
    // };
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

    app.get("/api/v1/testimonial", verify, async (req, res) => {
      try {
        const result = await testimonialCollection.find().toArray();
        res.json(result);
      } catch (error) {
        console.log("Error fetching testimonials:", error);
      }
    });

    app.post("/api/v1/jwt", async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, "khaled", { expiresIn: "1h" });
      console.log(token);
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "none",
        })
        .send({ success: true, token });
    });

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

// const { MongoClient, ObjectId } = require("mongodb");
// const cookieParser = require("cookie-parser");
// const express = require("express");
// const jwt = require("jsonwebtoken");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();
// const port = process.env.PORT || 5000;

// // Middleware
// app.use(express.json());
// app.use(cookieParser());
// app.use(
//   cors({
//     credentials: true, // Allow cookies to be sent in CORS requests
//     origin: "http://yourfrontend.com", // Replace with your frontend's URL
//   })
// );

// // MongoDB Configuration
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vx7njxc.mongodb.net/restaurant?retryWrites=true&w=majority`;

// const client = new MongoClient(uri, { useUnifiedTopology: true });

// // MongoDB Connection
// async function run() {
//   try {
//     await client.connect();

//     // Define the testimonialCollection
//     const testimonialCollection = client.db().collection("testimonial");

//     // Define the purchaseOrdersCollection
//     const purchaseOrdersCollection = client.db().collection("purchaseOrders");

//     // Define the foodItemsCollection
//     const foodItemsCollection = client.db().collection("foodItems");

//     // JWT Secret (should be stored securely)
//     const jwtSecret = process.env.JWT_SECRET || "shhhhh";

//     // Define JWT middleware for token verification
//     const verifyToken = (req, res, next) => {
//       const token = req.cookies?.token;
//       if (!token) {
//         return res.status(401).send({ status: "unauthorized access" });
//       }
//       jwt.verify(token, jwtSecret, (err, decoded) => {
//         if (err) {
//           return res.status(401).send({ status: "unauthorized access" });
//         }
//         next();
//       });
//     };

//     // Routes
//     app.get("/api/v1/testimonial", async (req, res) => {
//       try {
//         const result = await testimonialCollection.find().toArray();
//         res.json(result);
//       } catch (error) {
//         console.error("Error fetching testimonials:", error);
//         res.status(500).send({ message: "Internal Server Error" });
//       }
//     });

//     app.post("/api/v1/jwt", async (req, res) => {
//       const user = req.body;
//       const token = jwt.sign(user, jwtSecret, { expiresIn: "1h" });
//       res.cookie("token", token, {
//         httpOnly: true,
//         secure: false,
//         sameSite: "none",
//       });
//       res.json({ success: true, token });
//     });

//     app.post("/api/v1/purchaseOrders", async (req, res) => {
//       try {
//         const order = req.body;
//         const result = await purchaseOrdersCollection.insertOne(order);
//         res.json(result);
//       } catch (error) {
//         console.error(error);
//         res.status(500).send({ message: "Internal Server Error" });
//       }
//     });

//     app.delete("/api/v1/purchaseOrders/:orderId", async (req, res) => {
//       try {
//         const { orderId } = req.params;
//         const query = { _id: new ObjectId(orderId) };
//         const result = await purchaseOrdersCollection.deleteOne(query);
//         res.json(result);
//       } catch (error) {
//         console.error(error);
//         res.status(500).send({ message: "Internal Server Error" });
//       }
//     });

//     app.post("/api/v1/foodItems", verifyToken, async (req, res) => {
//       try {
//         const body = req.body;
//         const result = await foodItemsCollection.insertOne(body);
//         res.json(result);
//       } catch (error) {
//         console.error("Error processing the JSON data:", error);
//         res.status(500).send({ message: "Internal Server Error" });
//       }
//     });

//     // Define a route
//     app.get("/", (req, res) => {
//       res.send("Hello, World!");
//     });

//     // Start the server
//     app.listen(port, () => {
//       console.log(`Server is running on port ${port}`);
//     });
//   } catch (error) {
//     console.error("MongoDB connection error:", error);
//   }
// }

// run().catch(console.error);
