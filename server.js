require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.static("public"));
const mongoose = require("mongoose");
const ShortUrl = require("./models/shortUrl");
const path = require("path");
const cors = require("cors");

const MONGODB_URI = "mongodb://localhost:27017/urlShortener";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", async (req, res) => {
  const shortUrls = await ShortUrl.find();
  console.log(shortUrls);
  res.json(shortUrls);
});

app.post("/shortUrls", async (req, res) => {
  const { fullUrl, customShortId } = req.body;
  console.log("Creating short URL:", { fullUrl, customShortId });

  const existingUrl = await ShortUrl.findOne({ short: customShortId });
  if (existingUrl) {
    console.log("Short URL already exists:", existingUrl);
    return res.status(409).send("This name is already in use");
  }

  if (!customShortId) {
    return res.status(400).send("You need to input a customize url");
  }

  try {
    const newUrl = await ShortUrl.create({
      full: fullUrl,
      short: customShortId,
    });
    console.log("New short URL created:", newUrl);
    res.json(newUrl); // Devuelve el objeto URL creado
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error creating the short URL: " + error.message });
  }
});

app.delete("/shortUrls/:id", async (req, res) => {
  try {
    const deletedUrl = await ShortUrl.findByIdAndDelete(req.params.id);
    if (!deletedUrl) {
      return res
        .status(404)
        .send({ message: "No short URL found with this ID" });
    }
    res
      .status(200)
      .send({ message: "Short URL deleted successfully", deletedUrl });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Error deleting short URL: " + error.message });
  }
});

app.get("/:shortUrl", async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
    if (shortUrl) {
      shortUrl.clicks++;
      await shortUrl.save();
      res.redirect(shortUrl.full);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error("Error when redirecting:", error);
    res.sendStatus(500);
  }
});

//middleware
app.use(express.static("public"));

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
