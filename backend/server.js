const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const port = 8081;

app.use(express.json({ limit: "50mb" })); // This is important for handling large base64 image payloads
app.use(cors());

app.use((req, res, next) => {
  const contentLength = req.headers["content-length"];
  console.log(
    `Incoming Request: ${req.method} ${req.path} - Data size: ${
      contentLength || "0"
    } bytes`
  );
  next();
});

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.post("/login", async (req, res) => {
  const { email, name } = req.body;

  try {
    // Connect to MongoDB
    await client.connect();
    const database = client.db("DB"); // Replace with your actual database name
    const usersCollection = database.collection("users");

    // Check if the user exists in the database
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      // User already exists
      res.status(200).json({ message: "existing", user: existingUser });
    } else {
      // Insert a new user
      const newUser = {
        email,
        name,
        following: "",
        username: email.split("@")[0],
      };
      await usersCollection.insertOne(newUser);
      res.status(201).json({ message: "new", user: newUser });
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    // Close the client
    await client.close();
  }
});

// New Route to Upload Base64 Image
app.post("/upload-image", async (req, res) => {
  const { email, base64Image, apiResponse } = req.body; // Expecting email, base64Image, and GPT apiResponse

  try {
    // Connect to MongoDB
    await client.connect();
    const database = client.db("DB"); // Replace with your actual database name
    const imagesCollection = database.collection("images");

    // Insert image with owner email and GPT response
    const newImage = {
      owner: email,
      image: base64Image,
      apiResponse: apiResponse, // Store the GPT response here
    };

    await imagesCollection.insertOne(newImage);

    res
      .status(201)
      .json({ message: "Image uploaded successfully", image: newImage });
  } catch (error) {
    console.error("Error uploading image and GPT response to MongoDB:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    // Close the client
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
