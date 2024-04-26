const express = require("express");
const mongoose = require("mongoose");
const ShortUrl = require("./models/shortUrl");
const app = express();

mongoose
  .connect("mongodb://localhost:27017/urlShortener", {})
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.error("MongoDB connection error:", err));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  const shortUrls = await ShortUrl.find();
  console.log(shortUrls);
  res.render("index", { shortUrls: shortUrls });
});

app.post("/shortUrls", async (req, res) => {
  const { fullUrl, customShortId } = req.body;

  // Comprobar si el identificador personalizado ya está en uso
  const existingUrl = await ShortUrl.findOne({ short: customShortId });
  if (existingUrl) {
    return res.status(409).send("This name is already in use");
  }

  if (!customShortId) {
    return res.status(400).send("You need to input a customize url");
  }

  try {
    await ShortUrl.create({ full: fullUrl, short: customShortId });
    res.redirect("/");
  } catch (error) {
    return res
      .status(500)
      .send("Error creating the short URL " + error.message);
  }
});

app.get("/:shortUrl", async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
  if (shortUrl == null) return res.sendStatus(404);

  res.redirect(shortUrl.full);
});

app.listen(process.env.PORT || 5000);
