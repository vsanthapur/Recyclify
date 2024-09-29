const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const port = 8081;

app.use(express.json({ limit: "50mb" }));
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

app.get("/achievements", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("DB");
    const achievementsCollection = database.collection("achievements");

    const achievements = await achievementsCollection.find({}).toArray();
    res.status(200).json(achievements);
  } catch (error) {
    console.error("Error retrieving achievements from MongoDB:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await client.close();
  }
});

app.put("/users", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("DB");
    const usersCollection = database.collection("users");

    const { email, newEmail, username } = req.body;

    const result = await usersCollection.updateOne(
      { email: email },
      { $set: { email: newEmail, username: username } }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "User updated successfully" });
    } else {
      res.status(404).json({ message: "User not found or no changes made" });
    }
  } catch (error) {
    console.error("Error updating user in MongoDB:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await client.close();
  }
});

app.get("/users", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("DB");
    const usersCollection = database.collection("users");

    const email = req.query.email;

    const user = await usersCollection.findOne({ email: email });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error retrieving user from MongoDB:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await client.close();
  }
});

app.get("/images", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("DB");
    const imageCollection = database.collection("images");
    const images = await imageCollection.find({}).toArray();
    res.status(200).json(images);
  } catch (error) {
    console.error("Error retrieving users from MongoDB:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await client.close();
  }
});

app.get("/leaderboard", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("DB");
    const usersCollection = database.collection("users");
    const imagesCollection = database.collection("images");

    const users = await usersCollection.find({}).toArray();

    const leaderboard = [];

    for (const user of users) {
      const userImages = await imagesCollection
        .find({ owner: user.email })
        .toArray();

      const totalRecyclable = userImages.filter(
        (img) => img.apiResponse.recyclable
      ).length;
      const totalPoints = userImages.reduce(
        (sum, img) => sum + img.apiResponse.Points,
        0
      );

      leaderboard.push({
        name: user.name,
        username: user.username,
        totalRecyclable,
        totalPoints,
      });
    }

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error generating leaderboard:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await client.close();
  }
});

app.post("/login", async (req, res) => {
  const { email, name } = req.body;

  try {
    await client.connect();
    const database = client.db("DB");
    const usersCollection = database.collection("users");

    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      res.status(200).json({ message: "existing", user: existingUser });
    } else {
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
    await client.close();
  }
});

app.post("/upload-image", async (req, res) => {
  const { email, base64Image, apiResponse } = req.body;

  try {
    await client.connect();
    const database = client.db("DB");
    const imagesCollection = database.collection("images");

    const newImage = {
      owner: email,
      image: base64Image,
      apiResponse: apiResponse,
    };

    await imagesCollection.insertOne(newImage);

    res
      .status(201)
      .json({ message: "Image uploaded successfully", image: newImage });
  } catch (error) {
    console.error("Error uploading image and GPT response to MongoDB:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await client.close();
  }
});

app.post("/recycling-data", async (req, res) => {
  const { email } = req.body; // Extract the email from the request body

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Connect to MongoDB
    await client.connect();
    const database = client.db("DB"); // Replace with your actual database name
    const imagesCollection = database.collection("images");

    // Find documents where the owner is the specified email
    const results = await imagesCollection.find({ owner: email }).toArray(); // Convert the result to an array

    if (results.length > 0) {
      res.status(200).json(results); // Return the full documents
    } else {
      res.status(404).json({ message: "No data found for this email" });
    }
  } catch (error) {
    console.error("Error querying MongoDB:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
