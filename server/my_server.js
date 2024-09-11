const express = require("express");
const path = require("path");
const myapi = require("./my_api");
const cors = require("cors");
const session = require("express-session");

const app = express();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(express.static(path.join(__dirname, "..", "client")));

app.use("/api", myapi);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

const PORT = process.env.PORT || 8089;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
