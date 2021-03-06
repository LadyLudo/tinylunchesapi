require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");

const usersRouter = require("./users/users-router");
const itemsRouter = require("./items/items-router");
const authRouter = require("./auth/auth-router");
const PantryRouter = require("./pantry/pantry-router");
const SavedLunchRouter = require("./saved_lunches/saved_lunches-router");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use("/api/users", usersRouter);
app.use("/api/items", itemsRouter);
app.use("/api/auth", authRouter);
app.use("/api/pantry", PantryRouter);
app.use("/api/savedlunches", SavedLunchRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Tiny Lunches API");
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});
module.exports = app;
