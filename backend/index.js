require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const { errorHandler } = require("./middlewares/error");

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

//routes middleware
app.use("/user", userRoute);
app.use("/grant", grantRoute);
app.use("/announcement", announcementRoute);
app.use("/post", postRoute);

app.use(errorHandler);

app.listen(process.env.PORT, () =>
  console.log("Server is up and running on port: " + process.env.PORT)
);
