require("dotenv").config();
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const credentials = require("./middleware/credentials");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const connectDB = require("./db/conn");
const path = require("path");

const app = express();
const port = process.env.PORT || 4000;

// CORS middleware
app.use(credentials);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());

// API routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/roles", require("./routes/roleRoutes"));
app.use("/recipes", require("./routes/recipeRoutes"));
app.use("/upload", require("./routes/imageRoutes"));
app.use("/ingredient", require("./routes/ingredientRoutes"));
app.use("/category", require("./routes/categoryRoutes"));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handler
app.use(errorHandler);

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => {
    console.error(`Error connecting to MongoDB: ${err}`);
  });
