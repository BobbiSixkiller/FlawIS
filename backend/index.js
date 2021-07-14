require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

//middleware
app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/public", express.static("public"));
app.use(morgan("dev"));

//DB connecttion
mongoose.connect(
  process.env.DB_DEV_ATLAS,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("DB connected!");
    }
  }
);

//import routes
const userRoute = require("./routes/user");
const grantRoute = require("./routes/grant");
const announcementRoute = require("./routes/announcement");
const postRoute = require("./routes/post");
const { MulterError } = require("multer");

//routes middleware
app.use("/user", userRoute);
app.use("/grant", grantRoute);
app.use("/announcement", announcementRoute);
app.use("/post", postRoute);

app.use(function (error, req, res, next) {
  // error will not be a Multer error.
  if (error instanceof multer.MulterError) {
    console.log("FIRE");
    res.status(400).send({ error: true, msg: "File not supported!" });
  } else {
    res.status(500).send({ error: true, msg: "Internal server error." });
  }
});

app.listen(process.env.PORT, () =>
  console.log("Server is up and running on port: " + process.env.PORT)
);
