const express = require("express");
const path = require("path");
const apiRouter = require("./my_api"); // Import API router

const app = express();

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for serving static files
app.use(express.static(path.join(__dirname, "..", "client")));

// Use the API router to handle API requests
app.use("/api", apiRouter);

// Serve static files for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

const PORT = process.env.PORT || 8089;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
