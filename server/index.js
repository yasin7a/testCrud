const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Enable cookies and authentication headers
};

app.use(cors(corsOptions));

// Connect to MongoDB using Mongoose
mailto:mongoose.connect("mongodb+srv://ya7:ya7@cluster0.nvuwtgo.mongodb.net/", {
  dbName: "DTA",
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

// Check for MongoDB connection errors
db.on("error", (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

// Define a Mongoose schema and model
const Schema = mongoose.Schema;
const itemSchema = new Schema(
  {
    randomNumber: String,
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model("Test", itemSchema);

// Middleware to parse JSON data
app.use(bodyParser.json());

// Serve static files from the "client/build" directory
app.use(express.static(path.join(__dirname, "client/build")));

// Create a new item
app.post("/items", async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to create item" });
  }
});

// Get a list of items with pagination
app.get("/items", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;
  const lastItemId = req.query.lastItemId || null;

  const filter = lastItemId ? { _id: { $gt: lastItemId } } : {};
  try {
    const count = await Item.countDocuments();
    const items = await Item.find(filter)
      // .sort({ createdAt: "desc" })
      .skip(skip)
      .limit(limitNumber)
      .exec();

    const totalPages = Math.ceil(count / limitNumber);
    const current_page = pageNumber;
    const last_page = totalPages === 0 ? 1 : totalPages;
    const total = count;
    res.status(200).json({
      items,
      pagination: {
        current_page,
        last_page,
        total,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve items" });
  }
});

// Update an item by ID
// app.put("/items/:id", async (req, res) => {
//   try {
//     const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     res.status(200).json(updatedItem);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to update item" });
//   }
// });

// Delete an item by ID
app.delete("/items/:id", async (req, res) => {
  try {
    await Item.findByIdAndRemove(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// React client routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/app/build/index.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}` ,);
});
