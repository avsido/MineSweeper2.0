const express = require("express");
const path = require("path");
const apiRouter = require("./my_api");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "..", "client")));

app.use("/api", apiRouter);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

const PORT = process.env.PORT || 8089;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
