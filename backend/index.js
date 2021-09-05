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
const utilRoutes = require("./routes/util");
const userRoutes = require("./routes/user");
const grantRoutes = require("./routes/grant");
const announcementRoutes = require("./routes/announcement");
const postRoutes = require("./routes/post");

//routes middleware
app.use("/util", utilRoutes);
app.use("/user", userRoutes);
app.use("/grant", grantRoutes);
app.use("/announcement", announcementRoutes);
app.use("/post", postRoutes);

app.use(errorHandler);

app.listen(process.env.PORT, () =>
  console.log("Server is up and running on port: " + process.env.PORT)
);
