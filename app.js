require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//importing my routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/blog");

//db connection
mongoose
  .connect(process.env.DB_URI || process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("DB CONNECTED");
  });

//middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//using my routes
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", blogRoutes);

//strarting a server
app.listen(process.env.PORT || 8000, () => {
  console.log(`app is running `);
});
