require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const client = require("./dbConfig");
const router = require("./routes/users");

app.use(express.json());
app.use(cors());

client.connect((err) => {
  if (err) console.log(err);
  else console.log(`Data logging initiated!`); //connecting to database
});

app.use("/users", router); // connecting routes

app.get("/", (req, res) => {
  res.status(200).send("ENgine started, ready to take off");
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`server started on post ${port}`);
});
